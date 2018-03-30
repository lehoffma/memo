import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {Router} from "@angular/router";
import {LogInService} from "../../shared/services/api/login.service";
import {AddressService} from "../../shared/services/api/address.service";
import {Address} from "../../shared/model/address";
import {ShoppingCartService} from "../../shared/services/shopping-cart.service";
import {MatSnackBar} from "@angular/material";
import {OrderService} from "../../shared/services/api/order.service";
import {Order} from "../../shared/model/order";
import {ShoppingCartContent} from "../../shared/model/shopping-cart-content";
import {UserBankAccountService} from "../../shared/services/api/user-bank-account.service";
import {BankAccount} from "../../shared/model/bank-account";
import {EventService} from "../../shared/services/api/event.service";
import {OrderStatus} from "../../shared/model/order-status";
import {Observable} from "rxjs/Observable";
import {combineLatest} from "rxjs/observable/combineLatest";
import {first, map, mergeMap} from "rxjs/operators";
import {OrderedItem} from "../../shared/model/ordered-item";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../../shared/services/api/user.service";
import {of} from "rxjs/observable/of";
import {debitRequiresAccountValidator} from "../../shared/validators/debit-requires-account.validator";

@Component({
	selector: "memo-checkout",
	templateUrl: "./checkout.component.html",
	styleUrls: ["./checkout.component.scss"]
})
export class CheckoutComponent implements OnInit {
	user$: Observable<User> = this.logInService.currentUser$;
	total$ = this.cartService.total$;

	formGroup: FormGroup;
	previousAddresses = [];
	previousAccounts = [];

	loading = false;

	constructor(private bankAccountService: UserBankAccountService,
				private formBuilder: FormBuilder,
				private cartService: ShoppingCartService,
				private eventService: EventService,
				private orderService: OrderService,
				private snackBar: MatSnackBar,
				private router: Router,
				private userService: UserService,
				private addressService: AddressService,
				private logInService: LogInService) {
		this.formGroup = this.formBuilder.group({
			"address": this.formBuilder.group({
				"addresses": [[]],
				"selectedAddress": [undefined, {
					validators: [Validators.required]
				}]
			}),
			"payment": this.formBuilder.group({
				"method": [undefined, {
					validators: [Validators.required]
				}],
				"bankAccounts": [[], {
					validators: []
				}],
				"selectedAccount": [undefined, {
					validators: []
				}]
			})
		});

		this.formGroup.get("payment").setValidators([debitRequiresAccountValidator()]);

		this.user$
			.pipe(
				mergeMap(user => combineLatest(
					user.addresses.map(addressId => this.addressService.getById(addressId)))
				),
				first()
			)
			.subscribe(addresses => {
				this.previousAddresses = [...addresses];
				this.formGroup.get("address").get("addresses").patchValue(addresses)
			});

		this.user$
			.pipe(
				mergeMap(user => combineLatest(
					user.bankAccounts.map(id => this.bankAccountService.getById(id))
				)),
				first()
			)
			.subscribe(accounts => {
				this.previousAccounts = [...accounts];
				this.formGroup.get("payment").get("bankAccounts").patchValue(accounts);
			});


		this.formGroup.valueChanges.subscribe(it => {
			const newAddresses = it.address.addresses;
			this.updateAddresses(this.previousAddresses, newAddresses);
			this.previousAddresses = [...newAddresses];

			const newAccounts = it.payment.bankAccounts;
			this.updateAccounts(this.previousAccounts, newAccounts);
			this.previousAccounts = [...newAccounts];
		});
	}

	ngOnInit() {
	}


	/**
	 *
	 * @param {Address[]} previousValue
	 * @param {Address[]} addresses
	 * @returns {Observable<User>}
	 */
	updateAddresses(previousValue: Address[], addresses: Address[]) {
		const combined$ = this.addressService.updateAddressesOfUser(previousValue, addresses, this.user$);

		combined$.subscribe(() => {
		}, error => console.error(error));

		return combined$;
	}

	/**
	 *
	 * @param {BankAccount[]} previousValue
	 * @param {BankAccount[]} accounts
	 * @returns {Observable<User>}
	 */
	updateAccounts(previousValue: BankAccount[], accounts: BankAccount[]) {
		const combined$ = this.bankAccountService.updateAccountsOfUser(previousValue, accounts, this.user$);

		combined$.subscribe(() => {
		}, error => console.error(error));

		return combined$;
	}

	/**
	 *
	 * @param {ShoppingCartContent} content
	 * @returns {Observable<any[]>}
	 */
	private combineCartContent(content: ShoppingCartContent) {
		return of(
			[...content.partys, ...content.tours, ...content.merch]
		);
	}

	/**
	 *
	 * @param events
	 * @returns {OrderedItem[]}
	 */
	private mapToOrderedItems(events): OrderedItem[] {
		return events
			.reduce((acc, event) => [...acc, ...new Array(event.amount)
				.fill(({
					id: null,
					item: event.item.id,
					price: event.item.price,
					status: OrderStatus.RESERVED,
					size: event.options ? event.options.size : null,
					color: event.options ? event.options.color : null,
					isDriver: event.isDriver ? event.isDriver : false,
					needsTicket: event.needsTicket ? event.needsTicket : false
				}))], []);
	}

	/**
	 *
	 * @param event
	 * @returns {Promise<void>}
	 */
	submit() {
		const bankAccount = this.formGroup.get("payment").get("selectedAccount").value;

		this.loading = true;
		this.logInService.accountObservable
			.pipe(
				first(),
				mergeMap(userId => this.cartService.content
					.pipe(
						first(),
						//combine cart content into one array
						mergeMap(content => this.combineCartContent(content)),
						//map events to orderedItem interface to make it usable on the backend
						map(events => this.mapToOrderedItems(events)),
						map(orderedItems => Order.create()
							.setProperties({
								user: userId,
								timeStamp: new Date(),
								method: this.formGroup.get("payment").get("method").value,
								items: orderedItems
							})),
						map(order => bankAccount ? order.setProperties({bankAccount: bankAccount.id}) : order),
						mergeMap(order => this.orderService.add(order))
					)
				)
			)
			.subscribe(
				value => {
					this.loading = false;
					//todo redirect to "order done" page
					this.snackBar.open("Bestellung abgeschlossen!", "Schließen", {duration: 2000});
					this.cartService.reset();
					this.router.navigateByUrl("/");
				},
				error => {
					console.error(error);
					this.snackBar.open(error, "Schließen", {duration: 2000});
				},
				() => {
				}
			);
	}
}

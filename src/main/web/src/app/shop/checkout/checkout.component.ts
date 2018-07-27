import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {Router} from "@angular/router";
import {LogInService} from "../../shared/services/api/login.service";
import {AddressService} from "../../shared/services/api/address.service";
import {Address} from "../../shared/model/address";
import {ShoppingCartService} from "../../shared/services/shopping-cart.service";
import {MatSnackBar} from "@angular/material";
import {OrderService} from "../../shared/services/api/order.service";
import {createOrder, Order} from "../../shared/model/order";
import {ShoppingCartContent} from "../../shared/model/shopping-cart-content";
import {UserBankAccountService} from "../../shared/services/api/user-bank-account.service";
import {BankAccount} from "../../shared/model/bank-account";
import {EventService} from "../../shared/services/api/event.service";
import {OrderStatus} from "../../shared/model/order-status";
import {combineLatest, Observable, of} from "rxjs";
import {distinctUntilChanged, filter, first, map, mergeMap} from "rxjs/operators";
import {OrderedItem} from "../../shared/model/ordered-item";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../../shared/services/api/user.service";
import {debitRequiresAccountValidator} from "../../shared/validators/debit-requires-account.validator";
import {ShoppingCartItem} from "../../shared/model/shopping-cart-item";
import {flatMap} from "../../util/util";
import {DiscountService} from "app/shop/shared/services/discount.service";
import {processInParallelAndWait} from "../../util/observable-util";
import {OrderedItemService} from "../../shared/services/api/ordered-item.service";
import {setProperties} from "../../shared/model/util/base-object";
import {PaymentMethod} from "./payment/payment-method";

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

	user: User;

	subscriptions = [];

	constructor(private bankAccountService: UserBankAccountService,
				private formBuilder: FormBuilder,
				private cartService: ShoppingCartService,
				private discountService: DiscountService,
				private orderedItemService: OrderedItemService,
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
				filter(user => user != null),
				distinctUntilChanged((x, y) => x.id === y.id)
			)
			.subscribe(user => {
				if (user == null) {
					return;
				}
				this.user = user;

				processInParallelAndWait(
					user.addresses.map(addressId => this.addressService.getById(addressId))
				)
					.pipe(first())
					.subscribe(addresses => {
						this.previousAddresses = [...addresses];
						this.formGroup.get("address").get("addresses").patchValue(addresses)
					});

				processInParallelAndWait(
					user.bankAccounts.map(id => this.bankAccountService.getById(id))
				)
					.pipe(first())
					.subscribe(accounts => {
						this.previousAccounts = [...accounts];
						this.formGroup.get("payment").get("bankAccounts").setValue(accounts);
					});

				if (this.subscriptions) {
					this.subscriptions.forEach(it => it.unsubscribe());
				}

				this.subscriptions = [
					this.formGroup.get("address").get("addresses").valueChanges
						.pipe(
							mergeMap(addresses => this.updateAddresses(this.previousAddresses, addresses))
						)
						.subscribe(addresses => {
							this.previousAddresses = [...addresses];
						}),
					this.formGroup.get("payment").get("bankAccounts").valueChanges
						.pipe(
							mergeMap(newAccounts => this.updateAccounts(this.previousAccounts, newAccounts))
						)
						.subscribe(newAccounts => {
							this.previousAccounts = [...newAccounts];
						})
				];
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
		return this.addressService.updateAddressesOfUser(previousValue, addresses, this.user);
	}

	/**
	 *
	 * @param {BankAccount[]} previousValue
	 * @param {BankAccount[]} accounts
	 * @returns {Observable<User>}
	 */
	updateAccounts(previousValue: BankAccount[], accounts: BankAccount[]) {
		return this.bankAccountService.updateAccountsOfUser(previousValue, accounts, this.user);
	}

	handleOrderedItems(orderedItems: OrderedItem[]) {
		if (orderedItems.length === 0) {
			return of([]);
		}
		return combineLatest(
			...orderedItems.map(item => this.orderedItemService.add(item))
		);
	}

	/**
	 *
	 * @param event
	 * @returns {Promise<void>}
	 */
	submit() {
		const bankAccount = this.formGroup.get("payment").get("method").value === PaymentMethod.DEBIT
			? this.formGroup.get("payment").get("selectedAccount").value
			: null;


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
						mergeMap(events => this.mapToOrderedItems(events, userId)),
						mergeMap(items => this.handleOrderedItems(items)),
						map(orderedItems => setProperties(createOrder(), {
							user: userId,
							timeStamp: new Date(),
							method: this.formGroup.get("payment").get("method").value,
							items: orderedItems.map(it => it.id)
						})),
						map((order: Order) => bankAccount ? setProperties(order, {bankAccount: bankAccount.id}) : order),
						mergeMap(order => this.orderService.add(order))
					)
				)
			)
			.subscribe(
				order => {
					this.orderService.completedOrder = order.id;
					this.loading = false;
					this.orderedItemService.invalidateCache();
					this.snackBar.open("Bestellung abgeschlossen!", "Schließen", {duration: 2000});
					this.cartService.reset();
					this.router.navigateByUrl("/order-complete");
				},
				error => {
					console.error(error);
					this.snackBar.open(error.message, "Schließen");
				},
				() => {
				}
			);
	}

	/**
	 *
	 * @param {ShoppingCartContent} content
	 * @returns {Observable<any[]>}
	 */
	private combineCartContent(content: ShoppingCartContent): Observable<ShoppingCartItem[]> {
		return of(
			[...content.partys, ...content.tours, ...content.merch]
		);
	}

	/**
	 *
	 * @param events
	 * @param userId
	 * @returns {OrderedItem[]}
	 */
	private mapToOrderedItems(events: ShoppingCartItem[], userId: number) {
		const items = flatMap(it => {
			const partialItem = {
				id: it.id,
				item: it.item.id,
				price: 0,
				status: OrderStatus.RESERVED
			};
			if (it.options && it.options.length > 0) {
				return it.options.map(option => ({
					...partialItem,
					...option
				}))
			}
			return [...new Array(it.amount)
				.fill({
					...partialItem,
					size: null,
					color: null,
					isDriver: false,
					needsTicket: false
				})]
		}, events);

		if (items.length === 0) {
			return of([]);
		}

		//setting discounted prices
		return combineLatest(
			...items.map(it => this.discountService.getDiscountedPriceOfEvent(it.item, userId)
				.pipe(
					map(discountedPrice => ({...it, price: discountedPrice}))
				))
		)
	}
}

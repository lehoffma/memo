import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {Router} from "@angular/router";
import {LogInService} from "../../shared/services/api/login.service";
import {AddressService} from "../../shared/services/api/address.service";
import {Address} from "../../shared/model/address";
import {PaymentMethod} from "./payment/payment-method";
import {ShoppingCartService} from "../../shared/services/shopping-cart.service";
import {MatSnackBar} from "@angular/material";
import {OrderService} from "../../shared/services/api/order.service";
import {Order} from "../../shared/model/order";
import {ShoppingCartContent} from "../../shared/model/shopping-cart-content";
import {UserBankAccountService} from "../../shared/services/api/user-bank-account.service";
import {BankAccount} from "../../shared/model/bank-account";
import {OrderedItem} from "../../shared/model/ordered-item";
import {EventService} from "../../shared/services/api/event.service";
import {OrderStatus} from "../../shared/model/order-status";
import * as moment from "moment";
import {Observable} from "rxjs/Observable";
import {combineLatest} from "rxjs/observable/combineLatest";
import {catchError, first, map, mergeMap, retry} from "rxjs/operators";
import {empty} from "rxjs/observable/empty";

@Component({
	selector: "memo-checkout",
	templateUrl: "./checkout.component.html",
	styleUrls: ["./checkout.component.scss"]
})
export class CheckoutComponent implements OnInit {
	paymentMethod: string;
	user$: Observable<User> = this.logInService.currentUser$;
	userAddresses$: Observable<Address[]> = this.user$
		.pipe(
			mergeMap(user => combineLatest(
				user.addresses.map(addressId => this.addressService.getById(addressId)))
			)
		);
	total$ = this.cartService.total;

	constructor(private bankAccountService: UserBankAccountService,
				private cartService: ShoppingCartService,
				private eventService: EventService,
				private orderService: OrderService,
				private snackBar: MatSnackBar,
				private router: Router,
				private addressService: AddressService,
				private logInService: LogInService) {

	}

	ngOnInit() {
	}

	deleteCart() {
		/** hier sollten alle items im warenkorb gelöscht werden */

	}

	onAddressChange(address: Address) {
		//todo maybe save as preferred address or something
	}

	/**
	 *
	 * @param {PaymentMethod} method
	 * @param {number} chosenBankAccount
	 * @param data
	 * @returns {number}
	 */
	async getBankAccountId(method: PaymentMethod, chosenBankAccount: number, data: any): Promise<number> {
		let bankAccount: (null | BankAccount) = null;
		if (method === PaymentMethod.DEBIT && chosenBankAccount === -1) {
			//add the bank account to the database if it doesn't exist yet
			bankAccount = await this.bankAccountService.add(BankAccount.create()
				.setProperties({
					name: data.firstName + " " + data.surname,
					iban: data.IBAN,
					bic: data.BIC
				})
			)
				.pipe(
					retry(3),
					catchError(error => {
						console.error(error);
						return empty<BankAccount>();
					})
				)
				.toPromise();
		}

		return bankAccount === null ? -1 : bankAccount.id;
	}

	/**
	 *
	 * @param event
	 * @returns {Promise<void>}
	 */
	async paymentSelectionDone(event: {
		method: PaymentMethod,
		chosenBankAccount: number,
		data: any
	}) {
		const bankAccountId: number = await this.getBankAccountId(event.method, event.chosenBankAccount, event.data);

		this.logInService.accountObservable
			.pipe(
				first(),
				mergeMap(userId => this.cartService.content
					.pipe(
						first(),
						//combine cart content into one array
						mergeMap((content: ShoppingCartContent) => combineLatest(
							...[...content.partys, ...content.tours, ...content.merch]
								.map(event => this.eventService.getById(event.id)
									.pipe(
										map(it => ({
											event: it,
											...event
										}))
									)
								)
						)),
						mergeMap(events => {
							//map events to orderedItem interface to make it usable on the backend
							const orderedItems: OrderedItem[] = events
								.reduce((acc, event) => [...acc, ...new Array(event.amount)
									.fill(({
										id: undefined,
										event: event.event,
										price: event.event.price,
										status: OrderStatus.RESERVED,
										size: event.options ? event.options.size : undefined,
										color: event.options ? event.options.color : undefined,
									}))], []);

							return this.orderService.add(Order.create()
								.setProperties({
									userId,
									timeStamp: moment(),
									method: event.method,
									bankAccount: bankAccountId,
									orderedItems
								}));
						})
					)
				)
			)
			.subscribe(
				value => {
					this.snackBar.open("Bestellung abgeschlossen!", "Schließen", {duration: 2000});
					this.cartService.reset();
				},
				error => {
					this.snackBar.open(error, "Schließen", {duration: 2000});
				},
				() => {
					this.router.navigateByUrl("/");
				}
			);
	}
}

import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {UserService} from "../../shared/services/user.service";
import {Observable} from "rxjs/Observable";
import {Router} from "@angular/router";
import {LogInService} from "../../shared/services/login.service";
import {AddressService} from "../../shared/services/address.service";
import {Address} from "../../shared/model/address";
import {PaymentMethod} from "./payment/payment-method";
import {ShoppingCartService} from "../../shared/services/shopping-cart.service";
import {MdSnackBar} from "@angular/material";
import {OrderService} from "../../shared/services/order.service";
import {Order} from "../../shared/model/order";
import {ShoppingCartContent} from "../../shared/model/shopping-cart-content";
import {UserBankAccountService} from "../../shared/services/user-bank-account.service";
import {BankAccount} from "../../shared/model/bank-account";
import {OrderedItem} from "../../shared/model/ordered-item";
import {EventService} from "../../shared/services/event.service";
import {OrderStatus} from "../../shared/model/order-status";

@Component({
	selector: "memo-checkout",
	templateUrl: "./checkout.component.html",
	styleUrls: ["./checkout.component.scss"]
})
export class CheckoutComponent implements OnInit {
	paymentMethod: string;
	user$: Observable<User> = this.logInService.accountObservable
		.flatMap(id => this.userService.getById(id));
	userAddresses$: Observable<Address[]> = this.user$
		.flatMap(user => Observable.combineLatest(
			user.addresses.map(addressId => this.addressService.getById(addressId))
		));
	total$ = this.cartService.total;

	constructor(private userService: UserService,
				private bankAccountService: UserBankAccountService,
				private cartService: ShoppingCartService,
				private eventService: EventService,
				private orderService: OrderService,
				private snackBar: MdSnackBar,
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
				.retry(3)
				.catch(error => {
					console.error(error);
					return Observable.empty<BankAccount>();
				})
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
		let bankAccountId: number = await this.getBankAccountId(event.method, event.chosenBankAccount, event.data);

		this.logInService.accountObservable
			.first()
			.flatMap(userId => {
				return this.cartService.content
					.first()
					.flatMap((content: ShoppingCartContent) => {
						return Observable.combineLatest(
							...[...content.partys, ...content.tours, ...content.merch]
								.map(event => this.eventService.getById(event.id)
									.map(_event => ({
										event: _event,
										...event
									})))
						)
					})
					.flatMap(events => {
						let orderedItems: OrderedItem[] = events
							.map(event => ({
								id: event.id,
								price: event.event.price,
								status: OrderStatus.NONE,
								amount: event.amount,
								options: event.options
							}));

						return this.orderService.add(Order.create()
							.setProperties({
								userId,
								date: new Date(),
								payment: {
									method: event.method,
									bankAccount: bankAccountId
								},
								orderedItems
							}));
					})
			})
			.subscribe(value => {
				this.snackBar.open("Bestellung abgeschlossen!", "Schließen", {duration: 2000});
			}, error => {
				this.snackBar.open(error, "Schließen", {duration: 2000});
			}, () => {
				this.cartService.reset();
				this.router.navigateByUrl("/");
			});
	}
}

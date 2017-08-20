import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {UserService} from "../../shared/services/user.service";
import {Observable} from "rxjs/Observable";
import {ActivatedRoute, Router} from "@angular/router";
import {LogInService} from "../../shared/services/login.service";
import {AddressService} from "../../shared/services/address.service";
import {Address} from "../../shared/model/address";
import {PaymentMethod} from "./payment/payment-method";
import {ShoppingCartService} from "../../shared/services/shopping-cart.service";
import {EventService} from "../../shared/services/event.service";
import {MdSnackBar} from "@angular/material";

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
				private cartService: ShoppingCartService,
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
		console.log(address);
		//todo maybe save as preferred address or something
	}

	paymentSelectionDone(event: {
		method: PaymentMethod,
		data: any
	}) {
		//todo: shopService or orderService or something
		//example call: this.orderService.order(method, cartContent, userId, data)
		//todo remove demo
		Observable.of(null)
			.delay(2000)
			.subscribe(value => {
				this.snackBar.open("Bestellung abgeschlossen!", "Schließen", {duration: 2000});
			}, error => {
				this.snackBar.open(error, "Schließen", {duration: 2000});
			}, () => {
				this.cartService.reset();
				this.router.navigateByUrl("/");
			})
	}
}

import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {UserService} from "../../shared/services/user.service";
import {Observable} from "rxjs/Observable";
import {ActivatedRoute} from "@angular/router";
import {LogInService} from "../../shared/services/login.service";
import {AddressService} from "../../shared/services/address.service";
import {Address} from "../../shared/model/address";

@Component({
	selector: "memo-checkout",
	templateUrl: "./checkout.component.html",
	styleUrls: ["./checkout.component.scss"]
})
export class CheckoutComponent implements OnInit {
	paymentMethod: string;
	paymentMethodOptions: string[] = ["Paypal", "Barzahlung", "Überweisung", "Lastschrift"];
	user$: Observable<User> = this.logInService.accountObservable
		.flatMap(id => this.userService.getById(id));
	userAddresses$: Observable<Address[]> = this.user$
		.flatMap(user => Observable.combineLatest(
			user.addresses.map(addressId => this.addressService.getById(addressId))
		));

	constructor(private route: ActivatedRoute,
				private userService: UserService,
				private addressService: AddressService,
				private logInService: LogInService) {

	}

	ngOnInit() {
	}

	deleteCart() {
		/** hier sollten alle items im warenkorb gelöscht werden */

	}

}

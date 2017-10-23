import {Component, OnInit} from "@angular/core";
import {Address} from "../../../../shared/model/address";
import {ActivatedRoute, Router} from "@angular/router";
import {LogInService} from "../../../../shared/services/api/login.service";
import {Observable} from "rxjs/Rx";
import {UserService} from "../../../../shared/services/api/user.service";
import {AddressService} from "../../../../shared/services/api/address.service";
import {Wiggle} from "app/util/animation-util";

@Component({
	selector: "memo-address-modification",
	templateUrl: "./address-modification.component.html",
	styleUrls: ["./address-modification.component.scss"],
	animations: [
		Wiggle
	]
})
export class AddressModificationComponent implements OnInit {
	model: Address = Address.create();
	modifyingExistingAddress = false;


	constructor(private activatedRoute: ActivatedRoute,
				private loginService: LogInService,
				private userService: UserService,
				private router: Router,
				private addressService: AddressService) {

		//initialize the model with the corresponding address if the query params contain an "id" parameter
		this.activatedRoute.queryParamMap
			.first()
			.subscribe(queryParamMap => {
				if (queryParamMap.has("id")) {
					this.loginService.currentUser$
						.flatMap(user => Observable.combineLatest(
							user.addresses.map(addressId => this.addressService.getById(addressId))
						))
						.first()
						.subscribe(addresses => {
							addresses.filter(address => address.id === +queryParamMap.get("id"))
								.forEach(address => this.model = address);
							this.modifyingExistingAddress = true;
						})
				}
			})
	}

	ngOnInit() {
	}

	goBack() {
		let url = this.addressService.redirectUrl;
		if (!url) {
			url = "/";
		}
		this.router.navigateByUrl(url);
	}

	/**
	 * Calls the add() method of the address service and redirects back to where we came from (or to the home page
	 * if there is no saved url)
	 */
	submitNewAddress() {
		if (this.modifyingExistingAddress) {
			this.addressService.modify(this.model)
				.subscribe(address => {
					this.goBack();
				});
		}
		else {
			this.addressService.add(this.model)
				.flatMap(address => this.loginService.isLoggedIn() ?
					this.loginService.currentUser$
						.first()
						.map(user => user.setProperties({addresses: [...user.addresses, address.id]}))
						.flatMap(user => this.userService.modify(user))
					: Observable.of(null)
				)
				.first()
				.subscribe(address => {
					this.goBack();
				});
		}
	}
}


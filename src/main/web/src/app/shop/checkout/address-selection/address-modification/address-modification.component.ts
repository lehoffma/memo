import {Component, OnInit} from "@angular/core";
import {Address} from "../../../../shared/model/address";
import {ActivatedRoute, Router} from "@angular/router";
import {LogInService} from "../../../../shared/services/login.service";
import {Observable} from "rxjs/Observable";
import {UserService} from "../../../../shared/services/user.service";
import {AddressService} from "../../../../shared/services/address.service";
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
					this.loginService.accountObservable
						.flatMap(id => this.userService.getById(id))
						.flatMap(user => Observable.combineLatest(
							user.addresses.map(addressId => this.addressService.getById(addressId))
						))
						.first()
						.subscribe(addresses => {
							addresses.filter(address => address.id === +queryParamMap.get("id"))
								.forEach(address => this.model = address);
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
		this.addressService.add(this.model)
			.subscribe(address => {
				this.goBack();
			});
	}
}


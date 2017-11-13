import {Component, OnInit} from "@angular/core";
import {Address} from "../../../../shared/model/address";
import {ActivatedRoute, Router} from "@angular/router";
import {LogInService} from "../../../../shared/services/api/login.service";
import {UserService} from "../../../../shared/services/api/user.service";
import {AddressService} from "../../../../shared/services/api/address.service";
import {Wiggle} from "app/util/animation-util";
import {combineLatest} from "rxjs/observable/combineLatest";
import {filter, first, map, mergeMap, take, tap} from "rxjs/operators";
import {of} from "rxjs/observable/of";

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
			.pipe(
				first(),
				filter(queryParamMap => queryParamMap.has("id")),
				mergeMap(queryParamMap => this.loginService.currentUser$
					.pipe(
						mergeMap(user => combineLatest(
							user.addresses.map(addressId => this.addressService.getById(addressId))
						)),
						tap(addresses => {
							addresses.filter(address => address.id === +queryParamMap.get("id"))
								.forEach(address => this.model = address);
							this.modifyingExistingAddress = true;
						})
					)
				),
				take(1)
			)
			.subscribe();
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
				.subscribe(() => this.goBack());
		}
		else {
			this.addressService.add(this.model)
				.pipe(
					mergeMap(address => this.loginService.isLoggedIn()
						? this.loginService.currentUser$
							.pipe(
								map(user => user.setProperties({addresses: [...user.addresses, address.id]}))
							)
						: of(null)),
					filter(user => user !== null),
					mergeMap(user => this.userService.modify(user)),
					first()
				)
				.subscribe(() => this.goBack());
		}
	}
}


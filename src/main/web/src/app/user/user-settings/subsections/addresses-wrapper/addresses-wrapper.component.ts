import {Component} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {LogInService} from "../../../../shared/services/api/login.service";
import {AccountSettingsService} from "../account-settings.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {User} from "../../../../shared/model/user";
import {AddressService} from "../../../../shared/services/api/address.service";
import {forkJoin} from "rxjs";
import {first} from "rxjs/operators";
import {Address} from "../../../../shared/model/address";

@Component({
	selector: "memo-addresses-wrapper",
	templateUrl: "./addresses-wrapper.component.html",
	styleUrls: ["./addresses-wrapper.component.scss"]
})
export class AddressesWrapperComponent extends BaseSettingsSubsectionComponent {
	constructor(protected loginService: LogInService,
				protected accountSettingsService: AccountSettingsService,
				private addressService: AddressService,
				private formBuilder: FormBuilder) {
		super(loginService, accountSettingsService);
		this.formGroup = this.formBuilder.group({
			"addresses": []
		});

		this.init();
	}

	private previousAddresses = [];

	protected initFromUser(user: User, formGroup: FormGroup) {
		forkJoin(
			...user.addresses.map(addressId => this.addressService.getById(addressId))
		)
			.pipe(first())
			.subscribe(addresses => {
				this.previousAddresses = [...addresses];
				formGroup.get("addresses").setValue(addresses)
			})
	}

	hasChanges(user: User, value: Address[]) {
		if (this.previousAddresses.length !== value.length) {
			return true;
		}

		if(value.some(newAddr => newAddr.id === -1)){
			return true;
		}
	}
}

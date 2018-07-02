import {Component, Input, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {Address} from "../../model/address";

@Component({
	selector: "memo-address-form",
	templateUrl: "./address-form.component.html",
	styleUrls: ["./address-form.component.scss"]
})
export class AddressFormComponent implements OnInit {
	@Input() formGroup: FormGroup;
	@Input() selection = false;
	showInlineAddressForm = -1;
	showNewAddressForm = false;

	constructor() {
	}

	ngOnInit() {
	}

	updateAddress(newValue: Address, index: number = this.formGroup.get("addresses").value.length) {
		const currentValue: Address[] = this.formGroup.get("addresses").value;
		const newAddresses = [
			...(currentValue.slice(0, index)),
			newValue,
			...(currentValue.slice(index + 1))
		];
		this.formGroup.get("addresses").patchValue(newAddresses)
	}

	deleteAddress(index: number) {
		const currentValue: Address[] = this.formGroup.get("addresses").value;
		currentValue.splice(index, 1);
		this.formGroup.get("addresses").patchValue(currentValue)
	}
}

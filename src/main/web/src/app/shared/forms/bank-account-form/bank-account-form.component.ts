import {Component, Input, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {BankAccount} from "../../model/bank-account";

@Component({
	selector: "memo-bank-account-form",
	templateUrl: "./bank-account-form.component.html",
	styleUrls: ["./bank-account-form.component.scss"]
})
export class BankAccountFormComponent implements OnInit {
	@Input() formGroup: FormGroup;
	@Input() selection = false;

	showInlineForm = -1;
	showNewInputForm = false;

	constructor() {
	}

	ngOnInit() {
	}

	updateAccount(newValue: BankAccount, index: number = this.formGroup.get("bankAccounts").value.length) {
		const currentValue: BankAccount[] = this.formGroup.get("bankAccounts").value;
		const newAccounts = [
			...(currentValue.slice(0, index)),
			newValue,
			...(currentValue.slice(index + 1))
		];
		this.formGroup.get("bankAccounts").patchValue(newAccounts)
	}

	deleteAccount(index: number) {
		const currentValue: BankAccount[] = this.formGroup.get("bankAccounts").value;
		currentValue.splice(index, 1);
		this.formGroup.get("bankAccounts").patchValue(currentValue)
	}
}

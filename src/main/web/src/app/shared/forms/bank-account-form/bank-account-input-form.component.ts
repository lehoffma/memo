import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BankAccount, createBankAccount} from "../../model/bank-account";
import {ibanValidator} from "../../validators/iban.validator";
import {setProperties} from "../../model/util/base-object";

@Component({
	selector: "memo-bank-account-input-form",
	templateUrl: "./bank-account-input-form.component.html",
	styleUrls: ["./bank-account-input-form.component.scss"]
})
export class BankAccountInputFormComponent implements OnInit {
	@Output() onSubmit: EventEmitter<BankAccount> = new EventEmitter<BankAccount>();
	@Output() onCancel: EventEmitter<any> = new EventEmitter<any>();

	formGroup: FormGroup;


	id: number = -1;
	loading = false;

	constructor(private formBuilder: FormBuilder) {

		this.formGroup = this.formBuilder.group({
			name: ["", {
				validators: [Validators.required]
			}],
			iban: ["", {
				validators: []
			}],
			bic: ["", {
				validators: [Validators.required, Validators.pattern(/[a-zA-Z]{6}[a-zA-Z2-9][a-nA-Np-zP-Z0-9]([a-wyzA-WYZ0-9][a-zA-Z0-9]{2})?([xX]{3})?/)]
			}]
		});
		this.formGroup.get("iban").setValidators([Validators.required, ibanValidator()])
	}

	@Input() set account(account: BankAccount) {
		this.formGroup.patchValue(({
			name: account.name,
			iban: account.iban,
			bic: account.bic
		}));
		this.id = account.id;
	}

	ngOnInit() {
	}


	submit() {
		const account = setProperties(createBankAccount(), {
			id: this.id,
			iban: this.formGroup.value.iban,
			bic: this.formGroup.value.bic,
			name: this.formGroup.value.name
		});

		this.onSubmit.emit(account)
	}

}

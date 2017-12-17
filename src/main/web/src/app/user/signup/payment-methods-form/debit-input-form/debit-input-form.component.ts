import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {PaymentInfo} from "./payment-info";
import {Address} from "../../../../shared/model/address";

declare var IBAN;

@Component({
	selector: "memo-debit-input-form",
	templateUrl: "./debit-input-form.component.html",
	styleUrls: ["./debit-input-form.component.scss"]
})
export class DebitInputFormComponent implements OnInit, OnChanges {
	@Input() name: string = "";
	model: PaymentInfo = {
		iban: "",
		bic: "",
		address: Address.create()
			.setProperties({
				name: this.name
			})
	};
	@Output() onChange = new EventEmitter<{ formIsValid: boolean, paymentInfo: PaymentInfo }>();
	@Output() onAddressModification = new EventEmitter();

	constructor() {
	}

	ngOnInit() {
	}


	ngOnChanges(changes: SimpleChanges): void {
		// throw new Error("Method not implemented.");
		if (changes["name"]) {
			this.model.address.setProperties({
				name: changes["name"].currentValue
			});
		}
	}

	isValidIBAN(iban: string) {
		return IBAN.isValid(iban);
	}

	emitOnChange(form) {
		this.onChange.emit({
			formIsValid: !form.form.invalid,
			paymentInfo: this.model
		});
	}

}

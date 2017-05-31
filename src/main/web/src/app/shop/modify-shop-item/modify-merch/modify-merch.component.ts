import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";

@Component({
	selector: "memo-modify-merch",
	templateUrl: "./modify-merch.component.html",
	styleUrls: ["./modify-merch.component.scss"]
})
export class ModifyMerchComponent implements OnInit {

	@Input() model: any = {stock: []};
	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<any> = new EventEmitter();

	ModifyType = ModifyType;
	priceIsValid = true;

	get merchModel() {
		return this.model;
	}

	set merchModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
	}

	constructor(private location: Location) {
	}

	ngOnInit() {
	}

	checkValidityOfPrice() {
		this.priceIsValid = new RegExp(/^[\d]+(([.,])[\d]{1,2})?$/).test(this.merchModel["price"])
	}

	cancel() {
		this.location.back();
	}

	submitModifiedObject() {
		this.onSubmit.emit(this.model);
	}
}

import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {ModifyItemEvent} from "../modify-item-event";

@Component({
	selector: "memo-modify-merch",
	templateUrl: "./modify-merch.component.html",
	styleUrls: ["./modify-merch.component.scss"]
})
export class ModifyMerchComponent implements OnInit {
	@Input() model: any = {stock: []};
	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<ModifyItemEvent> = new EventEmitter();

	ModifyType = ModifyType;
	priceIsValid = true;
	uploadedImage: FormData;
	defaultImageUrl = "resources/images/Logo.png";

	constructor(private location: Location) {
	}

	get merchModel() {
		return this.model;
	}

	set merchModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
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
		this.onSubmit.emit({
			model: this.model,
			uploadedImage: this.uploadedImage
		});
	}

	profilePictureChanged(event) {
		this.uploadedImage = event;
	}
}

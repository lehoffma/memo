import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {ModifyItemEvent} from "../modify-item-event";

@Component({
	selector: "memo-modify-party",
	templateUrl: "./modify-party.component.html",
	styleUrls: ["./modify-party.component.scss"]
})
export class ModifyPartyComponent implements OnInit {
	@Input() model: any;
	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<ModifyItemEvent> = new EventEmitter();

	ModifyType = ModifyType;

	defaultImageUrl = "resources/images/Logo.png";
	uploadedImage: FormData;


	get partyModel() {
		return this.model;
	}

	set partyModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
	}


	hours = [];
	minutes = [];

	constructor(private location: Location) {
		for (let i = 0; i < 24; i++) {
			this.hours.push(i);
		}
		for (let i = 0; i < 60; i++) {
			this.minutes.push(i);
		}
	}

	ngOnInit() {
	}

	/**
	 * Go back to where the user came from
	 */
	cancel() {
		this.location.back();
	}

	/**
	 * Emit submit event
	 */
	submitModifiedObject() {
		this.onSubmit.emit({
			model: this.model,
			uploadedImage: this.uploadedImage
		});
	}

	/**
	 * Updates the currently uploaded image
	 * @param event
	 */
	profilePictureChanged(event) {
		this.uploadedImage = event;
	}
}

import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {ModifyItemEvent} from "../modify-item-event";

@Component({
	selector: "memo-modify-tour",
	templateUrl: "./modify-tour.component.html",
	styleUrls: ["./modify-tour.component.scss"]
})
export class ModifyTourComponent implements OnInit {
	@Input() model: any;
	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<ModifyItemEvent> = new EventEmitter();

	//todo time picker

	defaultImageUrl = "resources/images/Logo.png";
	uploadedImage: FormData;

	ModifyType = ModifyType;

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

	get tourModel() {
		return this.model;
	}

	set tourModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
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
	 * Updates the currently uploaded image
	 * @param event
	 */
	profilePictureChanged(event) {
		this.uploadedImage = event;
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
}

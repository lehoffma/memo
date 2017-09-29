import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {ModifyItemEvent} from "../modify-item-event";
import {Moment} from "moment";

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

	constructor(private location: Location) {
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
	 *
	 */
	updateTimeOfDate() {
		const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
		const result = timeRegex.exec(this.model["time"]);
		if (result) {
			const hours = +result[1];
			const minutes = +result[2];
			(<Moment>this.model["date"]).hours(hours).minutes(minutes);
		}
		else {
			console.error("Time value " + this.model["time"] + " is not valid");
		}
	}

	/**
	 * Emit submit event
	 */
	submitModifiedObject() {
		this.updateTimeOfDate();

		this.onSubmit.emit({
			model: this.model,
			uploadedImage: this.uploadedImage
		});
	}


}

import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {ModifyItemEvent} from "../modify-item-event";
import {format, setHours, setMinutes} from "date-fns";
import {Permission} from "../../../../shared/model/permission";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {minArraySizeValidator} from "../../../../shared/validators/min-array-size.validator";
import {Tour} from "../../../shared/model/tour";

@Component({
	selector: "memo-modify-tour",
	templateUrl: "./modify-tour.component.html",
	styleUrls: ["./modify-tour.component.scss"]
})
export class ModifyTourComponent implements OnInit {
	formGroup: FormGroup;

	_previousValue: Tour;
	@Input() set previousValue(previousValue: Tour) {
		this._previousValue = previousValue;

		if (!previousValue) {
			return;
		}

		this.formGroup.get("event-data").get("title").patchValue(previousValue.title);
		this.formGroup.get("event-data").get("description").patchValue(previousValue.description);
		this.formGroup.get("event-data").get("date").patchValue(previousValue.date);
		this.formGroup.get("event-data").get("time").patchValue(format(previousValue.date, "HH:ss"));
		this.formGroup.get("event-data").get("capacity").patchValue(previousValue.capacity);
		this.formGroup.get("event-data").get("price").patchValue(previousValue.price);
		this.formGroup.get("event-data").get("vehicle").patchValue(previousValue.vehicle);
		this.formGroup.get("images").get("imagePaths").patchValue(previousValue.images);
		this.formGroup.get("permissions").get("expectedReadRole").patchValue(previousValue.expectedReadRole);
		this.formGroup.get("permissions").get("expectedWriteRole").patchValue(previousValue.expectedWriteRole);
		this.formGroup.get("permissions").get("expectedCheckInRole").patchValue(previousValue.expectedCheckInRole);
		this.formGroup.get("addresses").patchValue(previousValue.route)
	}

	get previousValue() {
		return this._previousValue;
	}

	@Input() mode: ModifyType;
	@Output() onSubmit: EventEmitter<ModifyItemEvent> = new EventEmitter();

	ModifyType = ModifyType;

	constructor(private location: Location,
				private formBuilder: FormBuilder) {
		this.formGroup = this.formBuilder.group({
			"event-data": this.formBuilder.group({
				"title": ["", {
					validators: [Validators.required]
				}],
				"description": ["", {
					validators: [Validators.required]
				}],
				"date": [undefined, {
					validators: [Validators.required]
				}],
				"vehicle": ["", {
					validators: [Validators.required]
				}],
				"time": ["00:00", {
					validators: [Validators.required, Validators.pattern(/([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/i)]
				}],
				"miles": [0],
				"price": [0, {
					validators: [Validators.required, Validators.pattern(/^[\d]+((\.|\,)[\d]{1,2})?$/)]
				}],
				"capacity": [0, {
					validators: [Validators.required, Validators.min(0)]
				}]
			}),
			"addresses": [[]],
			"images": this.formBuilder.group({
				"imagePaths": [[], {validators: []}],
				"imagesToUpload": [[], {validators: []}]
			}),
			"permissions": this.formBuilder.group({
				"expectedReadRole": [Permission.none, {
					validators: []
				}],
				"expectedWriteRole": [Permission.none, {
					validators: []
				}],
				"expectedCheckInRole": [Permission.none, {
					validators: []
				}]
			}),
			"responsible-users": [[]]
		})
	}

	ngOnInit() {
		this.formGroup.get("addresses").setValidators([Validators.required, minArraySizeValidator(1)]);
		this.formGroup.get("responsible-users").setValidators([minArraySizeValidator(1)]);
	}

	/**
	 * Go back to where the user came from
	 */
	cancel() {
		this.location.back();
	}

	/**
	 *
	 */
	updateTimeOfDate(date: Date, time: string): Date {
		const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
		const result = timeRegex.exec(time);
		if (result) {
			const hours = +result[1];
			const minutes = +result[2];
			return setMinutes(setHours(date, hours), minutes);
		}
		else {
			console.error("Time value " + time + " is not valid");
		}
		return null;
	}


	/**
	 * Emit submit event
	 */
	submitModifiedObject() {
		this.formGroup.get("event-data").get("date").patchValue(
			this.updateTimeOfDate(
				this.formGroup.get("event-data").get("date").value,
				this.formGroup.get("event-data").get("time").value
			)
		);
		const tour = Tour.create().setProperties<Tour>({
			title: this.formGroup.get("event-data").get("title").value,
			description: this.formGroup.get("event-data").get("description").value,
			date: this.formGroup.get("event-data").get("date").value,
			capacity: this.formGroup.get("event-data").get("capacity").value,
			price: this.formGroup.get("event-data").get("price").value,
			vehicle: this.formGroup.get("event-data").get("vehicle").value,
			miles: this.formGroup.get("event-data").get("miles").value,
			expectedReadRole: this.formGroup.get("permissions").get("expectedReadRole").value,
			expectedWriteRole: this.formGroup.get("permissions").get("expectedWriteRole").value,
			expectedCheckInRole: this.formGroup.get("permissions").get("expectedCheckInRole").value,
			route: this.formGroup.get("addresses").value,
			author: this.formGroup.get("responsible-users").value.map(it => it.id)
		});
		this.onSubmit.emit({
			item: tour,
			images: this.formGroup.get("images").value,
		});
	}

	meterToMiles(meters: number) {
		return meters * 0.000621371;
	}

}

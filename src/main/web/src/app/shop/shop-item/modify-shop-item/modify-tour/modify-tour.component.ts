import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";

@Component({
	selector: "memo-modify-tour",
	templateUrl: "./modify-tour.component.html",
	styleUrls: ["./modify-tour.component.scss"]
})
export class ModifyTourComponent implements OnInit {
	@Input() model: any;
	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<any> = new EventEmitter();

	defaultImageUrl = "resources/images/Logo.png";

	ModifyType = ModifyType;

	get tourModel() {
		return this.model;
	}

	set tourModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
	}

	constructor(private location: Location) {
	}

	ngOnInit() {
	}

	cancel() {
		this.location.back();
	}

	profilePictureChanged(event) {
		console.log(event);
	}

	submitModifiedObject() {
		this.onSubmit.emit(this.model);
	}
}

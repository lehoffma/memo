import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {ModifyItemEvent} from "../shared/modify-item-event";

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

	constructor(private location: Location) {
	}

	get partyModel() {
		return this.model;
	}

	set partyModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
	}

	ngOnInit() {
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

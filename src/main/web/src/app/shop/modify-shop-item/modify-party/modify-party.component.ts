import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";

@Component({
	selector: "memo-modify-party",
	templateUrl: "./modify-party.component.html",
	styleUrls: ["./modify-party.component.scss"]
})
export class ModifyPartyComponent implements OnInit {
	@Input() model: any;
	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<any> = new EventEmitter();

	ModifyType = ModifyType;

	get partyModel() {
		return this.model;
	}

	set partyModel(model: any) {
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

	submitModifiedObject() {
		this.onSubmit.emit(this.model);
	}
}

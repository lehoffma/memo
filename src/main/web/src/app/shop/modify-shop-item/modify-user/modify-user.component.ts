import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Gender} from "../../../shared/model/gender";

@Component({
	selector: "memo-modify-user",
	templateUrl: "./modify-user.component.html",
	styleUrls: ["./modify-user.component.scss"]
})
export class ModifyUserComponent implements OnInit {
	@Input() model: any;
	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<any> = new EventEmitter();

	ModifyType = ModifyType;


	get userModel() {
		return this.model;
	}

	set userModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
	}

	constructor() {
	}

	ngOnInit() {
	}

	submitModifiedObject(event){
		console.log(event);
		this.onSubmit.emit(this.model);
	}
}

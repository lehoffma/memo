import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {EntryCategory} from "../../../shared/model/entry-category";
import {Location} from "@angular/common";

@Component({
	selector: "memo-modify-entry",
	templateUrl: "./modify-entry.component.html",
	styleUrls: ["./modify-entry.component.scss"]
})
export class ModifyEntryComponent implements OnInit {
	@Input() model: any;
	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<any> = new EventEmitter();

	ModifyType = ModifyType;
	EntryCategory = EntryCategory;

	entryCategories = [EntryCategory.Food, EntryCategory.Fuel, EntryCategory.LeasingCar, EntryCategory.Tickets, EntryCategory.Tours];

	get entryModel() {
		return this.model;
	}

	set entryModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
	}

	constructor(private location:Location) {
	}

	ngOnInit() {
	}

	cancel(){
		this.location.back();
	}

	submitModifiedObject(){
		this.onSubmit.emit(this.model);
	}
}

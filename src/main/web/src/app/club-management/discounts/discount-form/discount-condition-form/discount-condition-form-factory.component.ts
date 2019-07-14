import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ConditionOption} from "./discount-condition-form.component";
import {ConditionType} from "../../../../shared/renderers/price-renderer/discount";
import {EventType} from "../../../../shop/shared/model/event-type";
import {ClubRole, clubRoles} from "../../../../shared/model/club-role";

@Component({
	selector: "memo-discount-condition-form-factory",
	templateUrl: "./discount-condition-form-factory.component.html",
	styleUrls: ["./discount-condition-form-factory.component.scss"]
})
export class DiscountConditionFormFactoryComponent implements OnInit {
	@Input() control: FormControl;
	@Input() type: ConditionOption;
	conditionType = ConditionType;

	minMaxFormGroup: FormGroup = this.fb.group({
		min: this.fb.control(""),
		max: this.fb.control("")
	});

	itemTypeOptions: { value: EventType, label: string; } [] = [
		{value: EventType.tours, label: "Tour"},
		{value: EventType.partys, label: "Veranstaltung"},
		{value: EventType.merch, label: "Merchandise"},
	];


	clubRoleOptions: ClubRole[] = clubRoles();

	constructor(private fb: FormBuilder) {
	}

	ngOnInit() {
	}

}

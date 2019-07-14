import {Component, Input, OnInit} from "@angular/core";
import {FormArray, FormBuilder, Validators} from "@angular/forms";
import {ConditionType} from "../../../../shared/renderers/price-renderer/discount";

export interface ConditionOption {
	key: string;
	label: string;
	formLabel?: string;
	type: ConditionType;
}

export const userDiscountConditions: ConditionOption[] = [
	{key: "users", label: "Userliste", formLabel: "User", type: ConditionType.userList},
	{key: "age", label: "Alter (min/max)", formLabel: "Alter", type: ConditionType.minMaxNumber},
	{
		key: "membershipDurationInDays",
		label: "Vereinszugehörigkeit in Tagen (min/max)",
		formLabel: "Vereinszugehörigkeit in Tagen",
		type: ConditionType.minMaxNumber
	},
	{key: "clubRoles", label: "Vereinsrolle", formLabel: "Rolle", type: ConditionType.clubRoleList},
	{key: "woelfeClubMembership", label: "Woelfeclub", formLabel: "Ist im Woelfeclub", type: ConditionType.boolean},
	{key: "seasonTicket", label: "Dauerkarte", formLabel: "Hat Dauerkarte", type: ConditionType.boolean},
	{key: "isStudent", label: "Student", formLabel: "Ist Student", type: ConditionType.boolean},
];

export const itemDiscountConditions: ConditionOption[] = [
	{key: "items", label: "Itemliste", formLabel: "Itemliste", type: ConditionType.itemList},
	{key: "price", label: "Preis (min/max)", formLabel: "Preis", type: ConditionType.minMaxNumber},
	{key: "itemTypes", label: "Itemtyp", formLabel: "Typ", type: ConditionType.itemTypeList},
	{key: "miles", label: "Meilen (min/max)", formLabel: "Meilen", type: ConditionType.minMaxNumber},
];

@Component({
	selector: "memo-discount-condition-form",
	templateUrl: "./discount-condition-form.component.html",
	styleUrls: ["./discount-condition-form.component.scss"]
})
export class DiscountConditionFormComponent implements OnInit {
	@Input() formArray: FormArray;

	@Input() emptyStateIcon: string;
	@Input() emptyStateTitle: string;
	@Input() emptyStateSubtitle: string;

	@Input() conditionOptions: ConditionOption[];

	constructor(private fb: FormBuilder) {
	}

	ngOnInit() {
	}

	addControl() {
		this.formArray.push(this.fb.group({
			type: this.fb.control("",  {validators: [Validators.required]}),
			value: this.fb.control(null, {validators: [Validators.required]})
		}))
	}

	removeControl(index: number) {
		this.formArray.removeAt(index);
	}
}

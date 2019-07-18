import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {FormArray, FormBuilder, Validators} from "@angular/forms";
import {ConditionType, Discount} from "../../../../shared/renderers/price-renderer/discount";
import {BehaviorSubject, Subject} from "rxjs";
import {map, takeUntil} from "rxjs/operators";
import {DiscountFormService} from "../discount-form.service";

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

export function discountKeyToConditionOption(key: keyof Discount): ConditionOption {
	let modifiedKey = key.replace(/^(min|max)/g, "");
	modifiedKey = modifiedKey.charAt(0).toLowerCase() + modifiedKey.slice(1);
	return [
		...userDiscountConditions,
		...itemDiscountConditions
	].find(condition => condition.key === modifiedKey);
}

@Component({
	selector: "memo-discount-condition-form",
	templateUrl: "./discount-condition-form.component.html",
	styleUrls: ["./discount-condition-form.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscountConditionFormComponent implements OnInit, OnDestroy {
	@Input() formArray: FormArray;

	@Input() emptyStateIcon: string;
	@Input() emptyStateTitle: string;
	@Input() emptyStateSubtitle: string;

	@Input() conditionOptions: ConditionOption[];


	usedOptions$: BehaviorSubject<ConditionOption[]> = new BehaviorSubject([]);
	onDestroy$ = new Subject();

	constructor(private fb: FormBuilder,
				private cdRef: ChangeDetectorRef,
				private discountFormService: DiscountFormService) {
		this.discountFormService.refresh$.pipe(takeUntil(this.onDestroy$))
			.subscribe(refresh => this.cdRef.detectChanges());
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

	ngOnInit() {
		this.formArray.valueChanges.pipe(
			map(value => value.map(it => it.type)),
			takeUntil(this.onDestroy$)
		).subscribe(value => this.usedOptions$.next(value));
	}

	filterUsedOptions(options: ConditionOption[], currentValue: ConditionOption, usedValues: ConditionOption[]) {
		if (currentValue) {
			usedValues = usedValues.filter(option => option.key !== currentValue.key);
		}

		return options.filter(option => !usedValues.find(used => used.key === option.key));
	}

	addControl() {
		this.formArray.push(this.fb.group({
			type: this.fb.control("", {validators: [Validators.required]}),
			value: this.fb.control(null,)
		}))
	}

	removeControl(index: number) {
		this.formArray.removeAt(index);
	}
}

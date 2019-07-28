import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {AbstractControl, FormBuilder, FormControl, Validators} from "@angular/forms";
import {ConditionOption} from "./discount-condition-form.component";
import {ConditionType} from "../../../../shared/renderers/price-renderer/discount";
import {EventType} from "../../../../shop/shared/model/event-type";
import {ClubRole, clubRoles} from "../../../../shared/model/club-role";
import {Subject} from "rxjs";
import {filter, takeUntil} from "rxjs/operators";
import {DiscountFormService} from "../discount-form.service";
import {isArray, isBoolean, isNullOrUndefined} from "util";

export enum ConditionFormType {
	BOOLEAN = "Boolean",
	LIST = "List",
	TEXT = "Text",
	MIN_MAX = "MinMax"
}

export const conditionFormTypes: ConditionFormType[] = [ConditionFormType.BOOLEAN, ConditionFormType.LIST, ConditionFormType.TEXT, ConditionFormType.BOOLEAN];

@Component({
	selector: "memo-discount-condition-form-factory",
	templateUrl: "./discount-condition-form-factory.component.html",
	styleUrls: ["./discount-condition-form-factory.component.scss"]
})
export class DiscountConditionFormFactoryComponent implements OnInit, OnDestroy {
	@Input() control: FormControl;
	@Input() type: ConditionOption;
	conditionType = ConditionType;
	conditionFormType = ConditionFormType;

	formControlMap: { [type in ConditionFormType]: AbstractControl } = {
		[ConditionFormType.BOOLEAN]: this.fb.control(false),
		[ConditionFormType.LIST]: this.fb.control([]),
		[ConditionFormType.TEXT]: this.fb.control(""),
		[ConditionFormType.MIN_MAX]: this.fb.group({
			min: this.fb.control("", {validators: [Validators.pattern(/^\d*$/)]}),
			max: this.fb.control("", {validators: [Validators.pattern(/^\d*$/)]})
		})
	};

	typeCheckMap: { [type in ConditionFormType]: () => boolean } = {
		[ConditionFormType.BOOLEAN]: () => this.type.type === ConditionType.boolean,
		[ConditionFormType.LIST]: () => [ConditionType.clubRoleList, ConditionType.itemList, ConditionType.itemTypeList, ConditionType.userList].some(
			type => this.type.type === type
		),
		[ConditionFormType.TEXT]: () => false, //todo
		[ConditionFormType.MIN_MAX]: () => [ConditionType.minMaxDate, ConditionType.minMaxNumber, ConditionType.minMaxPrice].some(
			type => this.type.type === type
		)
	};

	suffixMap: { [key: string]: string } = {
		age: "Jahre",
		membershipDurationInDays: "Tage"
	};

	itemTypeOptions: { value: EventType, label: string; } [] = [
		{value: EventType.tours, label: "Tour"},
		{value: EventType.partys, label: "Veranstaltung"},
		{value: EventType.merch, label: "Merchandise"},
	];

	clubRoleOptions: ClubRole[] = clubRoles();

	onDestroy$ = new Subject();

	constructor(private fb: FormBuilder,
				private cdRef: ChangeDetectorRef,
				private discountFormService: DiscountFormService,) {
		this.discountFormService.refresh$.pipe(takeUntil(this.onDestroy$))
			.subscribe(() => {
				this.cdRef.detectChanges();
			});

		Object.keys(this.formControlMap).forEach(type => {
			this.formControlMap[type].valueChanges.pipe(filter(() => this.typeCheckMap[type]()), takeUntil(this.onDestroy$))
				.subscribe(value => this.control.setValue(value));
		});
	}


	ngOnInit() {
		this.setFromControl();
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

	private setFromControl() {
		let value = this.control.value;
		const currentType = this.type.type;
		const currentFormType = Object.keys(this.typeCheckMap).find(key => this.typeCheckMap[key]());

		const isMinMax = currentFormType === ConditionFormType.MIN_MAX;
		if (isMinMax) {
			if (isNullOrUndefined(value) || isArray(value) || isBoolean(value)) {
				value = {min: null, max: null};
			}
			this.formControlMap[currentFormType].setValue({...value});
		} else {
			this.formControlMap[currentFormType].setValue(value);
		}
	}
}

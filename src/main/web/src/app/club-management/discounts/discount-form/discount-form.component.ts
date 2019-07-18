import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BehaviorSubject, combineLatest, Observable, of, Subject} from "rxjs";
import {ConditionType, Discount} from "../../../shared/renderers/price-renderer/discount";
import {ActivatedRoute, Router} from "@angular/router";
import {filter, switchMap, take, takeUntil, tap} from "rxjs/operators";
import {DiscountService} from "../../../shop/shared/services/discount.service";
import {
	ConditionOption,
	discountKeyToConditionOption,
	itemDiscountConditions,
	userDiscountConditions
} from "./discount-condition-form/discount-condition-form.component";
import {integerToType, typeToInteger} from "../../../shop/shared/model/event-type";
import {User} from "../../../shared/model/user";
import {ShopItem} from "../../../shared/model/shop-item";
import {UserService} from "../../../shared/services/api/user.service";
import {EventService} from "../../../shared/services/api/event.service";
import {DiscountFormService} from "./discount-form.service";
import {isNumber} from "../../../util/util";
import {MatSnackBar} from "@angular/material";

export type ConditionFormType = { type: ConditionOption; value: any };

@Component({
	selector: "memo-discount-form",
	templateUrl: "./discount-form.component.html",
	styleUrls: ["./discount-form.component.scss"]
})
export class DiscountFormComponent implements OnInit, OnDestroy {
	userDiscountConditions = userDiscountConditions;
	itemDiscountConditions = itemDiscountConditions;

	//todo add warning if conditions don't match anything?
	formGroup: FormGroup = this.fb.group({
		amount: this.fb.control(0, {validators: [Validators.min(0.01)]}),
		isPercentage: this.fb.control(false),
		linkUrl: this.fb.control(""),
		linkText: this.fb.control(""),
		reason: this.fb.control("", {validators: [Validators.required]}),
		limitPerUserAndItem: this.fb.control(-1, {validators: [Validators.required, Validators.min(-1)]}),
		itemConditions: this.fb.array([]),
		userConditions: this.fb.array([]),
	});

	loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	disabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	error: any;

	itemMatches$: Observable<number> = of(5);
	userMatches$: Observable<number> = of(5);

	previousValue$: Observable<Discount> = this.activatedRoute.paramMap.pipe(
		switchMap(map => map.has("id")
			? of(true).pipe(
				tap(it => this.disabled$.next(true)),
				switchMap(() => this.discountService.getById(+map.get("id"))),
				tap(it => this.disabled$.next(false)),
			)
			: of(null)
		)
	);

	onDestroy$ = new Subject();

	constructor(private fb: FormBuilder,
				private discountService: DiscountService,
				private userService: UserService,
				private cdRef: ChangeDetectorRef,
				private itemService: EventService,
				private snackBar: MatSnackBar,
				private router: Router,
				private discountFormService: DiscountFormService,
				private activatedRoute: ActivatedRoute) {
		this.disabled$.pipe(takeUntil(this.onDestroy$))
			.subscribe(loading => {
				if (loading) {
					this.formGroup.disable();
				} else {
					this.formGroup.enable();
				}
			});

		this.discountFormService.refresh$.pipe(takeUntil(this.onDestroy$))
			.subscribe(it => this.cdRef.detectChanges());

		this.previousValue$.pipe(filter(it => it !== null), takeUntil(this.onDestroy$))
			.subscribe(previous => this.discountToForm(previous))
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true)
	}

	private discountToFormCondition(option: ConditionOption, discount: Discount): Observable<any> {
		switch (option.type) {
			case ConditionType.boolean:
				return of(discount[option.key]);
			case ConditionType.clubRoleList:
				return of(discount[option.key]);
			case ConditionType.itemTypeList:
				return of((discount[option.key] as number[]).map(it => integerToType(it)));
			case ConditionType.minMaxNumber:
			case ConditionType.minMaxPrice:
				const min = discount["min" + this.capitalizeFirstLetter(option.key)];
				const max = discount["min" + this.capitalizeFirstLetter(option.key)];
				return of({min, max});
			case ConditionType.userList:
				const value = discount[option.key] as number[];
				if (value.length > 0) {
					return combineLatest(value.map(id => this.userService.getById(id)));
				}
				return of([]);
			case ConditionType.itemList:
				const itemListValue = discount[option.key] as number[];
				if (itemListValue.length > 0) {
					return combineLatest(itemListValue.map(id => this.itemService.getById(id)));
				}
				return of([]);

		}
	}

	private addToConditionFormArray(discount: Discount, keys: string[], formArray: FormArray): Observable<any> {
		return combineLatest(keys
			.map((key: keyof Discount) => {
				const option = discountKeyToConditionOption(key);

				//frontend doesnt support this option yet
				if (!option) {
					return of(null);
				}

				return this.discountToFormCondition(option, discount)
					.pipe(
						tap(value => {
							console.log(option, value);
							formArray.push(this.fb.group({
								type: this.fb.control(option, {validators: [Validators.required]}),
								value: this.fb.control(value,)
							}))
						})
					)
			})
		);
	}

	private discountToForm(discount: Discount) {
		this.formGroup.enable();
		this.formGroup.get("amount").setValue(discount.amount);
		this.formGroup.get("isPercentage").setValue(discount.isPercentage);
		this.formGroup.get("linkUrl").setValue(discount.linkUrl);
		this.formGroup.get("linkText").setValue(discount.linkText);
		this.formGroup.get("reason").setValue(discount.reason);
		this.formGroup.get("limitPerUserAndItem").setValue(discount.limitPerUserAndItem);

		const userConditionFormArray: FormArray = this.formGroup.get("userConditions") as FormArray;
		userConditionFormArray.clear();

		const itemConditionsFormArray: FormArray = this.formGroup.get("itemConditions") as FormArray;
		itemConditionsFormArray.clear();

		const userConditionKeys: string[] = [
			"users", "minAge", "maxAge", "minMembershipDurationInDays", "maxMembershipDurationInDays", "clubRoles", "woelfeClubMembership",
			"seasonTicket", "isStudent",
		].filter(it => discount[it] !== null && discount[it] !== undefined
			&& (discount[it].length === undefined || discount[it].length > 0));

		const itemConditionKeys: string[] = [
			"items", "minPrice", "maxPrice", "itemTypes", "minMiles", "maxMiles"
		].filter(it => discount[it] !== null && discount[it] !== undefined
			&& (discount[it].length === undefined || discount[it].length > 0));


		combineLatest([
			this.addToConditionFormArray(discount, userConditionKeys, userConditionFormArray),
			this.addToConditionFormArray(discount, itemConditionKeys, itemConditionsFormArray),
		])
			.subscribe(it => {
				this.discountFormService.refresh();
			})
	}


	private capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	private addConditionFormValueToDiscount(type: ConditionOption, value: any, discount: Partial<Discount>): Partial<Discount> {
		switch (type.type) {
			case ConditionType.boolean:
				return {
					...discount,
					[type.key]: value
				};
			case ConditionType.clubRoleList:
				return {
					...discount,
					clubRoles: value
				};
			case ConditionType.itemTypeList:
				return {
					...discount,
					itemTypes: value.map(it => typeToInteger(it))
				};
			case ConditionType.minMaxNumber:
			case ConditionType.minMaxPrice:
				let copy = {...discount};
				if (isNumber(value.min)) {
					copy["min" + this.capitalizeFirstLetter(type.key)] = value.min
				}
				if (isNumber(value.max)) {
					copy["max" + this.capitalizeFirstLetter(type.key)] = value.max
				}
				return copy;
			case ConditionType.userList:
				return {
					...discount,
					users: (value as User[]).map(it => it.id)
				};
			case ConditionType.itemList:
				return {
					...discount,
					items: (value as ShopItem[]).map(it => it.id)
				}

		}
	}

	private formToDiscount(previousValue?: Discount): Partial<Discount> {
		const formValue = this.formGroup.value;
		const itemConditions = this.formGroup.value.itemConditions as ConditionFormType[];
		const userConditions = this.formGroup.value.userConditions as ConditionFormType[];

		let discount: Partial<Discount> = {
			...(previousValue || {}),
			id: (previousValue && previousValue.id) || null,
			amount: formValue.amount,
			isPercentage: formValue.isPercentage || false,
			linkUrl: formValue.linkUrl,
			linkText: formValue.linkText,
			reason: formValue.reason,
			limitPerUserAndItem: formValue.limitPerUserAndItem,
			outdated: false,
		};
		console.log(formValue, itemConditions, userConditions);

		discount = itemConditions.reduce((acc, condition) => {
			return this.addConditionFormValueToDiscount(condition.type, condition.value, acc);
		}, discount);

		discount = userConditions.reduce((acc, condition) => {
			return this.addConditionFormValueToDiscount(condition.type, condition.value, acc);
		}, discount);

		return discount;
	}

	submitModifiedObject() {
		this.loading$.next(true);
		this.previousValue$.pipe(
			take(1),
			switchMap(previous => {
				const newValue = this.formToDiscount(previous);
				console.log(newValue);
				if (previous) {
					return this.discountService.modify(newValue as Discount);
				} else {
					return this.discountService.add(newValue as Discount);
				}
			}),
		).subscribe(result => {
			console.log(result);
			this.snackBar.open("Discount erfolgreich gespeichert", "Okay", {duration: 5000});
			this.loading$.next(false);
			this.router.navigateByUrl("/management/discounts");
		}, error => {
			console.error(error);
			this.snackBar.open("Fehler! Konnte Discount nicht speichern", "Okay");
			this.loading$.next(false);
		});
	}

	cancel() {

	}

}

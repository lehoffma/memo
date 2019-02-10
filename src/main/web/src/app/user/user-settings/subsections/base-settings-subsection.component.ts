import {OnDestroy, OnInit} from "@angular/core";
import {combineLatest, Observable, Subject} from "rxjs";
import {User} from "../../../shared/model/user";
import {LogInService} from "../../../shared/services/api/login.service";
import {FormGroup} from "@angular/forms";
import {distinctUntilChanged, filter, map, take, takeUntil} from "rxjs/operators";
import {AccountSettingsService} from "./account-settings.service";
import {isEqual} from "date-fns";

export abstract class BaseSettingsSubsectionComponent implements OnInit, OnDestroy {
	public formGroup: FormGroup;
	public onDestroy$ = new Subject();
	public user$: Observable<User> = this.loginService.currentUser$;

	protected constructor(protected loginService: LogInService,
						  protected accountSettingsService: AccountSettingsService) {
		this.accountSettingsService.onReset.pipe(takeUntil(this.onDestroy$)).subscribe(it => this.reset(this.formGroup));
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

	init() {
		this.initFromUser$(this.formGroup);
		this.initChangeTracking(this.formGroup);
	}

	reset(formGroup: FormGroup) {
		this.initFromUser$(formGroup);
	}

	valuesAreEqual<T>(valueA: T, valueB: T) {
		if (valueA instanceof Date && valueB instanceof Date) {
			return isEqual(valueA, valueB);
		}
		const equalValues = [null, undefined, ""];
		if (equalValues.some(val => (valueA as any) === val) && equalValues.some(val => (valueB as any) === val)) {
			return true;
		}
		return valueA === valueB;
	}

	initChangeTracking(formGroup: FormGroup) {
		combineLatest(
			this.user$.pipe(filter(it => it !== null)),
			formGroup.valueChanges.pipe(distinctUntilChanged())
		).pipe(
			map(([user, value]) => {
				return Object.keys(value)
					.some(key => !this.valuesAreEqual(user[key], value[key]))
			}),
			takeUntil(this.onDestroy$)
		).subscribe(hasChanges => this.accountSettingsService.hasChanges$.next(hasChanges))
	}

	initFromUser$(formGroup: FormGroup) {
		this.user$.pipe(filter(it => it !== null), take(1)).subscribe(it => this.initFromUser(it, formGroup));
	}

	private initFromUser(user: User, formGroup: FormGroup) {
		const value = formGroup.value;
		const updatedValue = value;
		Object.keys(value)
			.filter(key => user.hasOwnProperty(key))
			.forEach(key => updatedValue[key] = user[key]);

		formGroup.setValue(updatedValue);
	}

}

import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {User} from "../../../shared/model/user";
import {UserService} from "../../../shared/services/api/user.service";
import {filter, first, map, startWith, take} from "rxjs/operators";
import {combineLatest, Observable, timer} from "rxjs";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {EMPTY} from "rxjs";

@Component({
	selector: "memo-responsible-user-input",
	templateUrl: "./responsible-user-input.component.html",
	styleUrls: ["./responsible-user-input.component.scss"],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: ResponsibleUserInputComponent,
		multi: true
	}]
})
export class ResponsibleUserInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
	@Input() formControl: FormControl;
	users$: Observable<User[]> = EMPTY;
	availableUsers$: Observable<User[]> = EMPTY;
	onChange;
	subscriptions = [];

	constructor(private userService: UserService) {
	}

	_previousValue: number[];

	get previousValue() {
		return this._previousValue;
	}

	@Input() set previousValue(previousValue: number[]) {
		this._previousValue = previousValue;

		if (!previousValue || previousValue.length === 0) {
			this.setValue([]);
			return;
		}

		combineLatest(
			...previousValue.map(it => this.userService.getById(it))
		)
			.pipe(first())
			.subscribe(users => this.setValue(users));

	}

	ngOnInit() {
		this.users$ = this.formControl.valueChanges;

		this.availableUsers$ = this.formControl.valueChanges.pipe(startWith([]));
		this.formControl.setValue([], {emitEvent: true});
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	addUser(user: User) {
		if (user !== null) {
			this.setValue([...this.formControl.value, user]);
		}
	}

	removeUser(index: number) {
		const currentValue = this.formControl.value;
		currentValue.splice(index, 1);
		this.setValue(currentValue);
	}

	setValue(users: User[]) {
		timer(0, 500)
			.pipe(
				//hack: sometimes _onChange is not yet initialized when we're attempting to set the value
				filter(it => this.onChange !== null),
				take(1),
				map(it => users)
			)
			.subscribe(values => {
				this.onChange(values);
			});
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		//nothing, we don't care about the touched events
	}

	setDisabledState(isDisabled: boolean): void {
		if (isDisabled) {
			this.formControl.disable();
		}
		else {
			this.formControl.enable();
		}
	}

	writeValue(obj: User[]): void {
		this.formControl.setValue(obj);
	}

}

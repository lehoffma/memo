import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {User} from "../../../model/user";
import {FormControl, Validators} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {EventUtilityService} from "../../../services/event-utility.service";
import {filter, map, mergeMap, startWith} from "rxjs/operators";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {MatInput} from "@angular/material";

@Component({
	selector: "memo-user-autocomplete",
	templateUrl: "./user-autocomplete.component.html",
	styleUrls: ["./user-autocomplete.component.scss"]
})
export class UserAutocompleteComponent implements OnInit, OnDestroy {
	_userList$ = new BehaviorSubject<User[]>([]);
	userList$ = this._userList$
		.pipe(
			filter(userList => userList !== undefined && userList !== null)
		);

	@Input() set userList(userList: User[]) {
		this._userList$.next(userList);
	}

	@Input() set required(required: boolean) {
		if (required) {
			this.autocompleteFormControl.setValidators(Validators.required)
		}
		else {
			this.autocompleteFormControl.clearValidators();
		}
	}

	@Input() resetOnSelect = true;

	@Output() userChanged = new EventEmitter<User>();

	_user: User = null;

	get user() {
		return this._user;
	}

	@Input() set user(user: User) {
		if (user !== this.user || (this.user && user && user.id !== this.user.id)) {
			this._user = user;
			this.autocompleteFormControl.setValue(user);
			this.userChanged.emit(user);
			if (user !== null && this.resetOnSelect) {
				this.autocompleteFormControl.reset();
			}
		}
	}


	@ViewChild("userInput") userInput: MatInput;
	autocompleteFormControl = new FormControl();
	filteredOptions: Observable<User[]>;


	subscriptions = [];

	constructor() {
	}

	ngOnInit() {
		this.subscriptions.push(
			this.autocompleteFormControl.valueChanges
				.subscribe(value => this.user = EventUtilityService.isUser(value)
					? value
					: null),

			this.userList$
				.subscribe(userList => {
					if (userList.length === 0) {
						this.autocompleteFormControl.disable();
					}
					else {
						this.autocompleteFormControl.enable();
					}
				})
		);


		this.filteredOptions = this.userList$
		//dont filter out the user that is being edited so we can still select him while editing
			.pipe(
				map(userList => userList.filter(it => this.user === null || this.user.id !== it.id)),
				mergeMap(users => this.autocompleteFormControl.valueChanges
					.pipe(
						startWith(null),
						map(user => user && typeof user === "object" ? user.name : user),
						map(name => name ? this.filter(users, name) : users.slice()))
				)
			);
	}


	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}


	/**
	 * Filters the options array by checking the users first and last name
	 * @param options
	 * @param name
	 * @returns {any[]}
	 */
	filter(options: User[], name: string): User[] {
		return options.filter(option => {
			const regex = new RegExp(`^${name}`, "gi");
			return regex.test(option.firstName + " " + option.surname) || regex.test(option.surname);
		});
	}


	/**
	 * Defines how the user will be presented in the autocomplete box
	 * @param user
	 * @returns {any}
	 */
	displayFn(user: User): string {
		if (user) {
			return user.firstName + " " + user.surname;
		}
		return "";
	}
}

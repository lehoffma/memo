import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {User} from "../../../model/user";
import {FormControl, Validators} from "@angular/forms";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {EventUtilityService} from "../../../services/event-utility.service";
import {debounceTime, map, mergeMap, startWith} from "rxjs/operators";
import {MatInput} from "@angular/material";
import {Filter} from "../../../model/api/filter";
import {UserService} from "../../../services/api/user.service";
import {PageRequest} from "../../../model/api/page-request";
import {Direction, Sort} from "../../../model/api/sort";

@Component({
	selector: "memo-user-autocomplete",
	templateUrl: "./user-autocomplete.component.html",
	styleUrls: ["./user-autocomplete.component.scss"]
})
export class UserAutocompleteComponent implements OnInit, OnDestroy {
	autocompleteFormControl = new FormControl();
	filteredOptions: Observable<User[]>;

	_additionalFilter$ = new BehaviorSubject<Filter>(Filter.none());

	userList$ = this.userService.get(Filter.none(), PageRequest.first(), Sort.none())
		.pipe(map(it => it.content));
	blackListedUsers$ = new BehaviorSubject<User[]>([]);
	@Input() resetOnSelect = true;
	@Output() userChanged = new EventEmitter<User>();
	@ViewChild("userInput") userInput: MatInput;
	subscriptions = [];

	constructor(private userService: UserService) {
	}

	@Input() set filter(filter: Filter) {
		this._additionalFilter$.next(filter);
	}

	@Input() set blackListedUsers(userList: User[]) {
		this.blackListedUsers$.next(userList);
	}

	@Input() set required(required: boolean) {
		if (required) {
			this.autocompleteFormControl.setValidators(Validators.required)
		}
		else {
			this.autocompleteFormControl.clearValidators();
		}
	}

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


		this.filteredOptions = combineLatest(
			this.autocompleteFormControl.valueChanges
				.pipe(
					startWith(null),
					map(user => user && typeof user === "object" ? user.name : user),
					debounceTime(300),
				),
			this._additionalFilter$
		).pipe(
			mergeMap(([input, additionalFilter]: [string, Filter]) =>
				this.userService.get(
					Filter.combine(
						Filter.by({"searchTerm": input}),
						additionalFilter
					),
					PageRequest.first(),
					Sort.by(Direction.DESCENDING, "firstName", "surname")
				)),
			map(it => it.content),
			map(users => {
				const blackListedUsers = this.blackListedUsers$.getValue();
				return users.filter(matchedUser => !blackListedUsers.find(user => matchedUser.id === user.id))
			})
		);
	}


	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
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

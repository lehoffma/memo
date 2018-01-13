import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {User} from "../../../shared/model/user";
import {UserService} from "../../../shared/services/api/user.service";
import {map} from "rxjs/operators";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {combineLatest} from "rxjs/observable/combineLatest";

@Component({
	selector: 'memo-responsible-user-input',
	templateUrl: './responsible-user-input.component.html',
	styleUrls: ['./responsible-user-input.component.scss']
})
export class ResponsibleUserInputComponent implements OnInit, OnDestroy {
	_users$ = new BehaviorSubject<User[]>([]);

	@Output() usersChanged = new EventEmitter<User[]>();

	availableUsers$ = combineLatest(
		this._users$,
		this.userService.search("")
	)
		.pipe(
			//filter out already listed users
			map(([responsibleUsers, users]) => users.filter(user =>
				!responsibleUsers.find(responsible => user.id === responsible.id)
			))
		);

	subscriptions = [];

	constructor(private userService: UserService) {
	}

	ngOnInit() {
		this.subscriptions.push(
			this._users$.subscribe(users => this.usersChanged.emit(users))
		)
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	addUser(user: User) {
		if (user !== null) {
			this._users$.next([...this._users$.getValue(), user]);
		}
	}

	removeUser(index: number) {
		const currentValue = this._users$.getValue();
		currentValue.splice(index, 1);
		this._users$.next(currentValue);
	}

}

import {Component, Input, OnInit} from '@angular/core';
import {User} from "../../shared/model/user";
import {UserService} from "../../shared/services/api/user.service";
import {attributeSortingFunction} from "../../util/util";
import {LogInService} from "../../shared/services/api/login.service";
import {LeaderboardRow} from "./leaderboard-row";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {map} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";

export interface LoggedInUserPosition extends LeaderboardRow {
	index: number;
}

@Component({
	selector: 'memo-miles-leaderboard',
	templateUrl: './miles-leaderboard.component.html',
	styleUrls: ['./miles-leaderboard.component.scss']
})
export class MilesLeaderboardComponent implements OnInit {
	//how many rows we want to show (useful for dashboard mini-version)
	//doesn't include the logged in user's row if he is not in one of the first N places
	@Input() amountOfRowsShown: number = 2;

	showAll$: BehaviorSubject<boolean> = new BehaviorSubject(false);

	users$ = this.userService.search("");

	leaderBoard$: Observable<LeaderboardRow[]> = this.users$
		.pipe(
			//sort by miles
			map(users => users.sort(attributeSortingFunction<User>("miles", true))
				.sort(attributeSortingFunction<User>("surname", true))),
			map(users => users.reduce((acc, user, index) => {
				let position = index + 1;

				if (index > 0 && acc[index - 1].miles === user.miles) {
					position = acc[index - 1].position;
				}

				return [...acc, {
					...user,
					position
				}];
			}, []))
		);

	loggedInUserId$ = this.loginService.accountObservable;

	loggedInUserPosition$: Observable<LoggedInUserPosition> = combineLatest(
		this.loggedInUserId$,
		this.leaderBoard$
	)
		.pipe(
			map(([id, leaderboard]) => {
				const index = leaderboard.findIndex(item => item.id === id);

				return {
					...leaderboard[index],
					position: leaderboard[index].position,
					index: index + 1
				}
			})
		);


	rowsAmount$ = combineLatest(
		this.leaderBoard$,
		this.showAll$
	)
		.pipe(
			map(([leaderboard, showAll]) => showAll
				? leaderboard.length
				: Math.min(this.amountOfRowsShown, leaderboard.length))
		);

	constructor(private userService: UserService,
				private loginService: LogInService) {
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param {boolean} value
	 */
	toggleShowAll(value: boolean) {
		this.showAll$.next(value);
	}
}

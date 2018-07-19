import {Component, Input, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {UserService} from "../../shared/services/api/user.service";
import {LogInService} from "../../shared/services/api/login.service";
import {LeaderboardRow} from "./leaderboard-row";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {map, mergeMap, tap} from "rxjs/operators";
import {MilesListEntry, MilesService} from "../../shared/services/api/miles.service";
import {ActivatedRoute, Router} from "@angular/router";
import {seasonOptions} from "../../shared/model/season-options";
import {Filter} from "../../shared/model/api/filter";
import {Sort} from "../../shared/model/api/sort";
import {attributeSortingFunction, combinedSortFunction} from "../../util/util";

export interface LoggedInUserPosition extends LeaderboardRow {
	index: number;
}

@Component({
	selector: "memo-miles-leaderboard",
	templateUrl: "./miles-leaderboard.component.html",
	styleUrls: ["./miles-leaderboard.component.scss"]
})
export class MilesLeaderboardComponent implements OnInit {
	//how many rows we want to show (useful for dashboard mini-version)
	//doesn't include the logged in user's row if he is not in one of the first N places
	@Input() amountOfRowsShown: number = Infinity;

	showAll$: BehaviorSubject<boolean> = new BehaviorSubject(false);

	users$ = this.userService.getAll(Filter.none(), Sort.none());
	loggedInUserId$ = this.loginService.accountObservable;

	leaderBoard$: BehaviorSubject<LeaderboardRow[]> = new BehaviorSubject<LeaderboardRow[]>(null);
	loggedInUserPosition$: Observable<LoggedInUserPosition> = combineLatest(
		this.loggedInUserId$,
		this.leaderBoard$
	)
		.pipe(
			map(([id, leaderboard]) => {
				if (!leaderboard) {
					return undefined;
				}

				const index = leaderboard.findIndex(item => item.id === id);

				if (index === -1) {
					return undefined;
				}

				return {
					...leaderboard[index],
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
				? ((leaderboard && leaderboard.length) || 0)
				: Math.min(this.amountOfRowsShown, ((leaderboard && leaderboard.length) || 0)))
		);
	selectedSeason$ = new BehaviorSubject<string>("Gesamt");
	seasonOptions = seasonOptions;
	subscriptions = [];

	constructor(private userService: UserService,
				private milesService: MilesService,
				private activatedRoute: ActivatedRoute,
				private router: Router,
				private loginService: LogInService) {

		this.subscriptions.push(this.activatedRoute.queryParamMap
				.subscribe(queryParamMap => {
					if (!queryParamMap.has("t")) {
						return;
					}
					const seasonWasSet = this.seasonOptions.some(option => {
						if (queryParamMap.get("t") === option) {
							this.selectedSeason = option;
							return true;
						}

						return false;
					});
					if (!seasonWasSet) {
						this.selectedSeason = "Gesamt";
					}
				}),
			this.selectedSeason$.subscribe(season => {
				this.router.navigate([], {queryParams: {t: season}})
			}),
			this.users$
				.pipe(
					//sort by miles
					mergeMap(users => this.addMiles(users)),
					map(users => users.sort(combinedSortFunction(
						attributeSortingFunction<User>("miles", true),
						attributeSortingFunction<User>("surname", true)
					))),
					map(users => users.reduce((acc, user, index) => {
						let position = index + 1;

						if (index > 0 && acc[index - 1].miles === user.miles) {
							position = acc[index - 1].position;
						}

						return [...acc, {
							...user,
							position
						}];
					}, [])),
				)
				.subscribe(it => this.leaderBoard$.next(it))
		);
	}

	get selectedSeason() {
		return this.selectedSeason$.getValue();
	}

	set selectedSeason(selectedSeason: string) {
		this.selectedSeason$.next(selectedSeason);
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

	private getMiles$(season: string): Observable<MilesListEntry[]> {
		if (season === "Gesamt") {
			return this.milesService.getAll();
		}
		return this.milesService.getAllForSeason(season);
	}

	private addMiles(users: User[]): Observable<any[]> {
		return this.selectedSeason$.pipe(
			tap(() => this.leaderBoard$.next(null)),
			mergeMap(season => this.getMiles$(season)),
			map(milesList => [
				...users.map(user => {
					const entry = milesList.find(it => it.userId === user.id);
					let miles = 0;
					if (entry) {
						miles = entry.miles;
					}
					return {
						...user,
						miles
					}
				})
			])
		);
	}
}

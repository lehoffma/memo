import {Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../../../shared/utility/material-table/util/expandable-table-container.service";
import {User} from "../../../shared/model/user";
import {LogInService} from "../../../shared/services/api/login.service";
import {NavigationService} from "../../../shared/services/navigation.service";
import {UserService} from "../../../shared/services/api/user.service";
import {debounceTime, defaultIfEmpty, distinctUntilChanged, map, takeUntil, tap} from "rxjs/operators";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {PageRequest} from "../../../shared/model/api/page-request";
import {Direction, Sort} from "../../../shared/model/api/sort";
import {getAllQueryValues} from "../../../shared/model/util/url-util";
import {Filter} from "../../../shared/model/api/filter";
import {ManualPagedDataSource} from "../../../shared/utility/material-table/manual-paged-data-source";
import {Router} from "@angular/router";

@Injectable()
export class MemberListService extends ExpandableTableContainerService<User> {
	sortedBy$: Observable<Sort> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => paramMap.has("sortBy") && paramMap.has("direction")
				? Sort.by(paramMap.get("direction"), getAllQueryValues(paramMap, "sortBy").join(","))
				: Sort.by(Direction.DESCENDING, "date")),
			distinctUntilChanged((a, b) => Sort.equal(a, b))
		);

	filteredBy$: Observable<Filter> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => {
				let paramObject = {};
				paramMap.keys
					.filter(key => !["page", "pageSize", "sortBy", "direction"].includes(key))
					.forEach(key => {
						let value = getAllQueryValues(paramMap, key).join(",");
						paramObject[key] = value;
					});
				return Filter.by(paramObject);
			}),
			distinctUntilChanged((a, b) => Filter.equal(a, b))
		);

	page$ = new BehaviorSubject(PageRequest.at(
		(+this.navigationService.queryParamMap$.getValue().get("page") || 1) - 1,
		(+this.navigationService.queryParamMap$.getValue().get("pageSize") || 20)
	));


	public dataSource: ManualPagedDataSource<User> = new ManualPagedDataSource<User>(this.userService, this.page$);
	entries$: Observable<User[]> = this.dataSource.connect();

	private resetPage = new Subject();
	private onDestroy$ = new Subject();
	constructor(private loginService: LogInService,
				private router: Router,
				private navigationService: NavigationService,
				public userService: UserService) {
		super(loginService.getActionPermissions("userManagement")
			.pipe(
				defaultIfEmpty({
					Hinzufuegen: false,
					Bearbeiten: false,
					Loeschen: false
				})
			));


		this.dataSource.isExpandable = false;
		this.dataSource.filter$ = this.filteredBy$;
		this.dataSource.sort$ = this.sortedBy$;

		this.dataSource.initPaginatorFromUrl(this.navigationService.queryParamMap$.getValue());
		this.dataSource.writePaginatorUpdatesToUrl(this.router);

		this.dataSource.updateOn(
			combineLatest(
				this.filteredBy$,
				this.sortedBy$
			).pipe(
				debounceTime(100),
				tap(() => this.resetPage.next()),
			)
		);

		this.resetPage.pipe(takeUntil(this.onDestroy$))
			.subscribe(it => this.pageAt(0));
	}

	/**
	 *
	 */
	add() {
		this.navigationService.navigateByUrl("/club/create/members");
	}

	/**
	 *
	 * @param user
	 */
	edit(user: User) {
		this.navigationService.navigateToItem(user, "/edit");
	}

	/**
	 * @param users
	 */
	remove(users: User[]) {
		users.forEach(user => this.userService.remove(user.id).subscribe(
			value => {
				if (this.dataSource) {
					this.dataSource.reload();
				}
			},
			error => console.log(error)
		));
	}


	pageAt(page: number) {
		const currentValue = this.page$.getValue();
		this.page$.next(PageRequest.at(page, currentValue.pageSize));
		this.dataSource.update();
	}
}

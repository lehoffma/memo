import {Component, HostListener, OnInit, Type} from "@angular/core";
import {UserService} from "../../../shared/services/user.service";
import {User} from "../../../shared/model/user";
import {Observable} from "rxjs/Observable";
import {ExpandedRowComponent} from "../../../shared/expandable-table/expanded-row.component";
import {SingleValueListExpandedRowComponent} from "../../../shared/expandable-table/single-value-list-expanded-row/single-value-list-expanded-row.component";
import {attributeSortingFunction} from "../../../util/util";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ColumnSortingEvent} from "../../../shared/expandable-table/column-sorting-event";
import {NavigationService} from "../../../shared/services/navigation.service";
import {ExpandableTableColumn} from "../../../shared/expandable-table/expandable-table-column";
import {memberListColumns} from "./member-list-columns";
import {ActionPermissions} from "../../../shared/expandable-table/expandable-table.component";
import {LogInService} from "../../../shared/services/login.service";

@Component({
	selector: "memo-member-list",
	templateUrl: "./member-list.component.html",
	styleUrls: ["./member-list.component.scss"]
})
export class MemberListComponent implements OnInit {
	_sortBy = new BehaviorSubject<ColumnSortingEvent<User>>({
		key: "id",
		descending: false
	});
	sortBy: Observable<ColumnSortingEvent<User>> = this._sortBy.asObservable();

	users: Observable<User[]> = Observable.combineLatest(this.userService.search(""), this.sortBy)
		.map(([users, sortBy]) => users.sort(attributeSortingFunction(sortBy.key, sortBy.descending)));

	userSubject$: BehaviorSubject<User[]> = new BehaviorSubject([]);

	rowComponent: Type<ExpandedRowComponent<User>> = SingleValueListExpandedRowComponent;

	primaryColumnKeys: BehaviorSubject<ExpandableTableColumn<User>[]> = new BehaviorSubject([]);
	expandedRowKeys: BehaviorSubject<ExpandableTableColumn<User>[]> = new BehaviorSubject([]);

	permissions$: Observable<ActionPermissions> = this.loginService.getActionPermissions("user");


	constructor(private userService: UserService,
				private loginService: LogInService,
				private navigationService: NavigationService) {
		this.updateColumnKeys(window.innerWidth);
		//todo wrap window in service
		this.users.subscribe(users => this.userSubject$.next(users));
	}

	ngOnInit() {
	}


	/**
	 * Updates the primary and secondary table keys according to the given screen width (higher width = more primary columns)
	 * @param {number} screenWidth
	 */
	updateColumnKeys(screenWidth: number) {
		let breakPoints = [
			{
				width: 0,
				columns: [memberListColumns.firstName, memberListColumns.surname, memberListColumns.clubRole]
			},
			{
				width: 500,
				columns: [memberListColumns.joinDate]
			},
			{
				width: 600,
				columns: [memberListColumns.birthday]
			},
			{
				width: 700,
				columns: [memberListColumns.hasSeasonTicket, memberListColumns.isWoelfeClubMember]
			},
			{
				width: 900,
				columns: [memberListColumns.gender]
			},
			{
				width: 1100,
				columns: [memberListColumns.telephone]
			}
		];

		let newColumns: ExpandableTableColumn<User>[] = breakPoints
			.filter(breakPoint => screenWidth > breakPoint.width)
			.reduce((acc, breakPoint) => [...acc, ...breakPoint.columns], []);


		this.primaryColumnKeys.next(newColumns);
		this.expandedRowKeys.next(Object.keys(memberListColumns)
			.filter(key => !newColumns.includes(memberListColumns[key]))
			.map(key => memberListColumns[key]))
	}

	@HostListener("window:resize", ["$event"])
	onResize(event) {
		this.updateColumnKeys(event.target.innerWidth);
	}

	/**
	 * Pushes a new sortBy value into the stream
	 * @param event
	 */
	updateSortingKey(event: ColumnSortingEvent<User>) {
		this._sortBy.next(event)
	}

	/**
	 *
	 * @param event
	 */
	addUser(event: any) {
		this.navigationService.navigateByUrl("members/create");
	}

	/**
	 *
	 * @param user
	 */
	editUser(user: User) {
		this.navigationService.navigateToItem(user, "/edit");
	}

	/**
	 * @param users
	 */
	deleteUsers(users: User[]) {
		users.forEach(user => this.userService.remove(user.id).subscribe(
			value => {
				this.userSubject$.next(
					this.userSubject$.value
						.filter(user => !users.some(deletedUser => deletedUser.id === user.id))
				)
			},
			error => console.log(error)
		));
	}
}

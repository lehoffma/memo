import {Component, HostListener, OnInit, Type} from "@angular/core";
import {UserService} from "../../../shared/services/user.service";
import {User} from "../../../shared/model/user";
import {Observable} from "rxjs/Observable";
import {ExpandedRowComponent} from "../../../shared/expandable-table/expanded-row.component";
import {MemberListExpandedRowComponent} from "./member-list-expanded-row/member-list-expanded-row.component";
import {attributeSortingFunction} from "../../../util/util";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ColumnSortingEvent} from "../../../shared/expandable-table/column-sorting-event";
import {NavigationService} from "../../../shared/services/navigation.service";
import {ExpandableTableColumn} from "../../../shared/expandable-table/expandable-table-column";
import {memberListColumns} from "./member-list-columns";

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

	rowComponent: Type<ExpandedRowComponent<User>> = MemberListExpandedRowComponent;

	primaryColumnKeys: BehaviorSubject<ExpandableTableColumn<User>[]> = new BehaviorSubject([]);
	expandedRowKeys: BehaviorSubject<ExpandableTableColumn<User>[]> = new BehaviorSubject([]);

	updateColumnKeys(screenWidth: number) {
		let newColumns: ExpandableTableColumn<User>[] = [
			memberListColumns.firstName, memberListColumns.surname, memberListColumns.clubRole
		];
		if (screenWidth > 500) {
			//todo abstufungen?
			newColumns.push(
				memberListColumns.birthDate, memberListColumns.telephone, memberListColumns.hasSeasonTicket,
				memberListColumns.isWoelfeClubMember, memberListColumns.gender, memberListColumns.joinDate
			)
		}
		this.primaryColumnKeys.next(newColumns);
		this.expandedRowKeys.next(Object.keys(memberListColumns)
			.filter(key => !newColumns.includes(memberListColumns[key]))
			.map(key => memberListColumns[key]))
	}

	@HostListener("window:resize", ["$event"])
	onResize(event) {
		this.updateColumnKeys(event.target.innerWidth);
	}

	constructor(private userService: UserService,
				private navigationService: NavigationService) {
		this.updateColumnKeys(window.innerWidth);
		//todo wrap window in service
	}

	ngOnInit() {
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
		//todo entkommentieren wenn server läuft
		// users.forEach(user => {
		// 	this.userService.remove(user.id);
		// });
	}
}

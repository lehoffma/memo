import {Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../../../shared/expandable-table/expandable-table-container.service";
import {User} from "../../../shared/model/user";
import {ColumnSortingEvent} from "../../../shared/expandable-table/column-sorting-event";
import {attributeSortingFunction, dateSortingFunction, SortingFunction} from "../../../util/util";
import {LogInService} from "../../../shared/services/api/login.service";
import {NavigationService} from "../../../shared/services/navigation.service";
import {UserService} from "../../../shared/services/api/user.service";
import {Dimension, WindowService} from "../../../shared/services/window.service";
import {memberListColumns} from "./member-list-columns";
import {ExpandableTableColumn} from "../../../shared/expandable-table/expandable-table-column";
import {defaultIfEmpty} from "rxjs/operators";

@Injectable()
export class MemberListService extends ExpandableTableContainerService<User> {

	constructor(private loginService: LogInService,
				private navigationService: NavigationService,
				private userService: UserService,
				private windowService: WindowService) {
		super({
				key: "id",
				descending: false
			},
			loginService.getActionPermissions("userManagement")
				.pipe(
					defaultIfEmpty({
						Hinzufuegen: false,
						Bearbeiten: false,
						Loeschen: false
					})
				),
			[]);


		this.init(this.userService.search("").pipe(
			defaultIfEmpty([])
		));

		this.windowService.dimension$
			.subscribe(dimensions => this.onResize(dimensions));
	}


	/**
	 * Updates the primary and secondary table keys according to the given screen width (higher width = more primary columns)
	 * @param {number} screenWidth
	 */
	onResize({width, height}: Dimension) {
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
				width: 1200,
				columns: [memberListColumns.images]
			}
		];

		let newColumns: ExpandableTableColumn<User>[] = breakPoints
			.filter(breakPoint => width > breakPoint.width)
			.reduce((acc, breakPoint) => {
				if (breakPoint.width === 1200) {
					return [...breakPoint.columns, ...acc];
				}
				return [...acc, ...breakPoint.columns]
			}, []);


		this.primaryColumnKeys$.next(newColumns);
		this.expandedRowKeys$.next(Object.keys(memberListColumns)
			.filter(key => !newColumns.includes(memberListColumns[key]))
			.map(key => memberListColumns[key]))
	}


	/**
	 *
	 */
	add() {
		this.navigationService.navigateByUrl("/create/members");
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
				this.dataSubject$.next(
					this.dataSubject$.value
						.filter(user => !users.some(deletedUser => deletedUser.id === user.id))
				)
			},
			error => console.log(error)
		));
	}

	satisfiesFilter(entry: User, ...options): boolean {
		return true;
	}

	comparator(sortBy: ColumnSortingEvent<User>, ...options): SortingFunction<User> {
		switch (sortBy.key) {
			case "birthday":
				return dateSortingFunction<User>(obj => obj["birthday"], sortBy.descending);
			case "joinDate":
				return dateSortingFunction<User>(obj => obj["joinDate"], sortBy.descending);
			default:
				return attributeSortingFunction(sortBy.key, sortBy.descending);
		}

	}
}

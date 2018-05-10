import {Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../../../shared/utility/material-table/util/expandable-table-container.service";
import {User} from "../../../shared/model/user";
import {LogInService} from "../../../shared/services/api/login.service";
import {NavigationService} from "../../../shared/services/navigation.service";
import {UserService} from "../../../shared/services/api/user.service";
import {defaultIfEmpty} from "rxjs/operators";
import {PagedDataSource} from "../../../shared/utility/material-table/paged-data-source";

@Injectable()
export class MemberListService extends ExpandableTableContainerService<User> {

	public dataSource: PagedDataSource<User>;

	constructor(private loginService: LogInService,
				private navigationService: NavigationService,
				private userService: UserService) {
		super(loginService.getActionPermissions("userManagement")
			.pipe(
				defaultIfEmpty({
					Hinzufuegen: false,
					Bearbeiten: false,
					Loeschen: false
				})
			));
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
				if (this.dataSource) {
					this.dataSource.reload();
				}
			},
			error => console.log(error)
		));
	}
}

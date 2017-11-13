import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Link} from "../../../../shared/model/link";
import {LogInService} from "../../../../shared/services/api/login.service";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {User} from "../../../../shared/model/user";
import {UserService} from "../../../../shared/services/api/user.service";
import {combineLatest} from "rxjs/observable/combineLatest";
import {map} from "rxjs/operators";

@Component({
	selector: "memo-toolbar-profile-link",
	templateUrl: "./toolbar-profile-link.component.html",
	styleUrls: ["./toolbar-profile-link.component.scss"]
})
export class ToolbarProfileLinkComponent implements OnInit {
	user: Observable<User> = this.loginService.currentUser$;

	accountLinks: Observable<Link[]> = combineLatest(this.navigationService.accountLinks, this.user)
		.pipe(
			map(([links, user]) => {
				if (user === null) {
					return links;
				}
				const setId = (link: Link): Link => {
					if (link.children) {
						link.children = link.children.map(childLink => setId(childLink))
					}
					link.route = link.route.replace("PROFILE_ID", "" + user.id);
					return link;
				};
				return links.map(setId)
			})
		);

	constructor(private loginService: LogInService,
				private navigationService: NavigationService) {
	}

	ngOnInit() {
	}

	logout() {
		this.loginService.logout()
			.subscribe(logout => null);
	}


	/**
	 * Navigiert zum login screen
	 */
	takeToLogin() {
		this.navigationService.navigateToLogin();
	}

}

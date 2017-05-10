import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Link} from "../../../../shared/model/link";
import {LogInService} from "../../../../shared/services/login.service";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {User} from "../../../../shared/model/user";
import {UserService} from "../../../../shared/services/user.service";

@Component({
	selector: "memo-toolbar-profile-link",
	templateUrl: "./toolbar-profile-link.component.html",
	styleUrls: ["./toolbar-profile-link.component.scss"]
})
export class ToolbarProfileLinkComponent implements OnInit {
	user: Observable<User> = this.loginService.accountObservable
		.flatMap(accountId => accountId !== null ? this.userService.getById(accountId) : Observable.of(null));

	accountLinks: Observable<Link[]> = Observable.combineLatest(this.navigationService.accountLinks, this.user)
		.map(([links, user]) => {
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
		});

	constructor(private loginService: LogInService,
				private userService: UserService,
				private navigationService: NavigationService) {
	}

	ngOnInit() {
	}

	logout() {
		this.loginService.logout();
	}


	/**
	 * Navigiert zur angegebenen URL
	 * @param url
	 */
	takeToPage(url: string) {
		this.navigationService.navigateByUrl(url);
	}

}

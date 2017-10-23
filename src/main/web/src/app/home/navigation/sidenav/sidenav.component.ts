import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {isNullOrUndefined} from "util";
import {User} from "../../../shared/model/user";
import {Link} from "../../../shared/model/link";
import {UserPermissions, visitorPermissions} from "../../../shared/model/permission";
import {NavigationService} from "../../../shared/services/navigation.service";
import {LogInService} from "../../../shared/services/api/login.service";
import {UserService} from "../../../shared/services/api/user.service";
import {Location} from "@angular/common";

@Component({
	selector: "memo-sidenav",
	templateUrl: "./sidenav.component.html",
	styleUrls: ["./sidenav.component.scss"]
})
export class SideNavComponent implements OnInit {
	@Output() sideBarClosed = new EventEmitter();

	public user: Observable<User> = this.logInService.currentUser$
		.flatMap(user => user === null
			? Observable.of(User.create().setProperties({id: -1}))
			: Observable.of(user));

	public links = Observable.combineLatest(this.user, this.navigationService.sidenavLinks)
		.map(([user, links]) => {
			const linksCopy = [...links];
			const permissions = user === null || user.id === -1
				? visitorPermissions
				: user.userPermissions;

			const setId = (link: Link): Link => {
				let newLink = {...link};
				if (newLink.children) {
					newLink.children = newLink.children.map(childLink => setId(childLink))
				}
				newLink.route = newLink.route.replace("PROFILE_ID", "" + user.id);
				return newLink;
			};

			return linksCopy.map(setId)
				.filter(link => (!link.loginNeeded || user !== null || user.id !== -1)
					&& this.checkPermissions(link.minimumPermission, permissions))
		});

	constructor(private navigationService: NavigationService,
				private logInService: LogInService,
				private location: Location,
				private userService: UserService) {

	}

	ngOnInit() {

	}


	/**
	 * Schließt die Seitennavigation
	 */
	closeSideNav() {
		this.sideBarClosed.emit({value: true});
	}


	/**
	 *
	 * @param minimumPermissions die minimalen Berechtigungsstufen, die der Nutzer erreichen/überschreiten muss,
	 *                           um den link anzusehen
	 * @param userPermissions die Berechtigungsstufen des Nutzers
	 * @returns {boolean}
	 */
	checkPermissions(minimumPermissions: UserPermissions, userPermissions: UserPermissions = visitorPermissions) {
		if (isNullOrUndefined(minimumPermissions)) {
			return true;
		}
		if (isNullOrUndefined(userPermissions)) {
			userPermissions = visitorPermissions;
		}

		return Object.keys(minimumPermissions)
			.every(
				(key: string) =>
					!isNullOrUndefined(userPermissions[key])
					&& !isNullOrUndefined(minimumPermissions[key])
					&& userPermissions[key] >= minimumPermissions[key]
			);
	}

	logout() {
		this.logInService.logout()
			.subscribe(logout => null);
	}

	saveUrl() {
		this.logInService.redirectUrl = this.location.path();
	}

	/**
	 * Navigiert zu der gegebenen URL
	 * @param url eine relative URL (z.b. 'login' leitet auf shop.meilenwoelfe.de/login weiter)
	 */
	navigate(url: string) {
		this.navigationService.navigateByUrl(url);
	}
}

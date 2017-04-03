import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {Link} from "../../shared/model/link";
import {NavigationService} from "../../shared/services/navigation.service";
import {Observable} from "rxjs/Observable";
import {LogInService} from "../../shared/services/login.service";
import {User} from "../../shared/model/user";
import {UserStore} from "../../shared/stores/user.store";
import {UserPermissions, visitorPermissions} from "../../shared/model/permission";
import {isNullOrUndefined} from "util";
@Component({
	selector: "navigation-sidenav",
	templateUrl: "./navigation-sidenav.component.html",
	styleUrls: ["./navigation-sidenav.component.scss"]
})
export class NavigationSideNavComponent implements OnInit {
	@Output() sideBarClosed = new EventEmitter();

	public links: Observable<Link[]> = this.navigationService.sidenavLinks;
	private user: Observable<User> = Observable.empty();

	get loggedIn() {
		return this.user !== null;
	}

	constructor(private navigationService: NavigationService,
				private logInService: LogInService,
				private userStore: UserStore) {

	}

	ngOnInit() {
		this.user = this.logInService.accountObservable
			.flatMap(accountId => accountId === null ? Observable.empty() : this.userStore.getDataByID(accountId));
	}

	/**
	 * Schließt die Seitennavigation
	 */
	closeSideNav() {
		this.sideBarClosed.emit({
			value: true
		});
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

		return Object.keys(minimumPermissions).every(
			(key: string) => userPermissions[key] >= minimumPermissions[key]
		);
	}

	/**
	 * Navigiert zu der gegebenen URL
	 * @param url eine relative URL (z.b. 'login' leitet auf shop.meilenwoelfe.de/login weiter)
	 */
	navigate(url: string) {
		this.navigationService.navigateByUrl(url);
	}
}

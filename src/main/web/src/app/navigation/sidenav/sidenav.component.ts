import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {Link} from "../../shared/model/link";
import {NavigationService} from "../../shared/services/navigation.service";
import {Observable} from "rxjs/Observable";
import {LogInService} from "../../shared/services/login.service";
import {UserStore} from "../../shared/stores/user.store";
import {UserPermissions, visitorPermissions} from "../../shared/model/permission";
import {isNullOrUndefined} from "util";
@Component({
	selector: "memo-sidenav",
	templateUrl: "./sidenav.component.html",
	styleUrls: ["./sidenav.component.scss"]
})
export class SideNavComponent implements OnInit {
	@Output() sideBarClosed = new EventEmitter();

	public links: Observable<Link[]> = this.navigationService.sidenavLinks;

	constructor(private navigationService: NavigationService,
				private logInService: LogInService,
				private userStore: UserStore) {

	}

	ngOnInit() {

	}

	get user() {
		return this.logInService.accountObservable
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

	logout() {
		this.logInService.logout();
	}

	/**
	 * Navigiert zu der gegebenen URL
	 * @param url eine relative URL (z.b. 'login' leitet auf shop.meilenwoelfe.de/login weiter)
	 */
	navigate(url: string) {
		this.navigationService.navigateByUrl(url);
	}
}

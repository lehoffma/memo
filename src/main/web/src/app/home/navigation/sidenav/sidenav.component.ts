import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {createUser, User} from "../../../shared/model/user";
import {NavigationService} from "../../../shared/services/navigation.service";
import {LogInService} from "../../../shared/services/api/login.service";
import {Location} from "@angular/common";
import {Observable, of} from "rxjs";
import {mergeMap} from "rxjs/operators";

@Component({
	selector: "memo-sidenav",
	templateUrl: "./sidenav.component.html",
	styleUrls: ["./sidenav.component.scss"]
})
export class SideNavComponent implements OnInit {
	@Output() sideBarClosed = new EventEmitter();

	public user: Observable<User> = this.logInService.currentUser$
		.pipe(
			mergeMap(user => user === null
				? of(createUser())
				: of(user))
		);

	public links = this.navigationService.sidenavLinks$;

	constructor(private navigationService: NavigationService,
				private logInService: LogInService,
				private location: Location) {

	}

	ngOnInit() {

	}


	/**
	 * Schließt die Seitennavigation
	 */
	closeSideNav() {
		this.sideBarClosed.emit({value: true});
	}


	logout() {
		this.logInService.logout()
			.subscribe(() => null);
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

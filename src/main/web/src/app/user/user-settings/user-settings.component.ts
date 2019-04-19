import {AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren} from "@angular/core";
import {AccountSettingsService} from "./subsections/account-settings.service";
import {ActivatedRoute, RouterLinkActive} from "@angular/router";
import {delay, map, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
	selector: "memo-user-settings",
	templateUrl: "./user-settings.component.html",
	styleUrls: ["./user-settings.component.scss"]
})
export class UserSettingsComponent implements OnInit, OnDestroy, AfterViewInit {
	hasChanges$ = this.accountSettingsService.hasChanges$;
	formIsValid$ = this.accountSettingsService.formIsValid$;

	@ViewChildren(RouterLinkActive) activeRoutes: QueryList<RouterLinkActive>;

	pages: {
		routerLink: string;
		name: string;
	}[] = [
		{
			routerLink: "/user/account-settings/personal-data",
			name: "Persönliche Daten"
		},
		{
			routerLink: "/user/account-settings/profile-picture",
			name: "Profilbild"
		},
		{
			routerLink: "/user/account-settings/addresses",
			name: "Addressen"
		},
		{
			routerLink: "/user/account-settings/account",
			name: "Account"
		},
		{
			routerLink: "/user/account-settings/club",
			name: "Vereinsinformationen"
		},
		{
			routerLink: "/user/account-settings/notifications",
			name: "Notifications"
		},
	];

	activePage: { routerLink: string; name: string };

	onDestroy$ = new Subject();

	constructor(public accountSettingsService: AccountSettingsService,
				private activatedRoute: ActivatedRoute) {
	}

	ngOnInit() {
	}

	ngAfterViewInit(): void {
		this.activatedRoute.url.pipe(
			delay(100),
			map(it => this.activeRoutes.filter(it => it.isActive)[0]),
			takeUntil(this.onDestroy$),
		)
			.subscribe(activeRoute => {
				const activeRouterLink = activeRoute.linksWithHrefs.toArray()[0].href;
				this.activePage = this.pages.find(it => it.routerLink === activeRouterLink);
			});
	}


	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}


}

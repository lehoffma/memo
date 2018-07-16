import {Component, Inject, LOCALE_ID, OnInit} from "@angular/core";
import {DateAdapter} from "@angular/material";
import {AuthService} from "./shared/authentication/auth.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {distinctUntilChanged, filter, map, mergeMap, startWith} from "rxjs/operators";
import {googleAnalytics, insertGoogleAnalyticsHeadScripts} from "../google-analytics-init";
import {BreadcrumbService} from "./shared/breadcrumb-navigation/breadcrumb.service";

import {NgcCookieConsentService, NgcStatusChangeEvent} from "ngx-cookieconsent";
import {combineLatest} from "rxjs";

@Component({
	selector: "memo-app",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {

	breadcrumbsJsonLd$ = this.router.events.pipe(
		filter(event => event instanceof NavigationEnd),
		distinctUntilChanged(),
		mergeMap(event => this.breadcrumbService.getJsonLd$(this.activatedRoute))
	);

	gaIsInitialized = false;

	constructor(private authService: AuthService,
				private breadcrumbService: BreadcrumbService,
				private cookieConsentService: NgcCookieConsentService,
				private dateAdapter: DateAdapter<Date>,
				private activatedRoute: ActivatedRoute,
				private router: Router,
				@Inject(LOCALE_ID) public locale: any) {
		dateAdapter.setLocale(locale); // DD.MM.YYYY
	}

	ngOnInit() {
		this.authService.initRefreshToken();

		combineLatest(
			this.cookieConsentService.statusChange$.pipe(
				map((event: NgcStatusChangeEvent) => event.status === "allow"),
				startWith(this.cookieConsentService.hasAnswered() && this.cookieConsentService.hasConsented())
			),
			this.router.events
				.pipe(
					filter(event => event instanceof NavigationEnd)
				)
		)
			.subscribe(([hasConsented, event]: [boolean, NavigationEnd]) => {
				if (!hasConsented) {
					return;
				}

				if(!this.gaIsInitialized){
					insertGoogleAnalyticsHeadScripts();
					this.gaIsInitialized = true;
				}

				const url = event.urlAfterRedirects;
				if (url !== null && url !== undefined && url !== "" && url.indexOf("null") < 0) {
					googleAnalytics(url);
				}
			});
	}
}

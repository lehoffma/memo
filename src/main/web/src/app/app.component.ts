import {Component, EventEmitter, Inject, LOCALE_ID, OnDestroy, OnInit, PLATFORM_ID} from "@angular/core";
import {DateAdapter} from "@angular/material/core";
import {AuthService} from "./shared/authentication/auth.service";
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from "@angular/router";
import {distinctUntilChanged, filter, map, mergeMap, startWith, takeUntil} from "rxjs/operators";
import {googleAnalytics, insertGoogleAnalyticsHeadScripts} from "../google-analytics-init";
import {BreadcrumbService} from "./shared/breadcrumb-navigation/breadcrumb.service";

import {NgcCookieConsentService, NgcStatusChangeEvent} from "ngx-cookieconsent";
import {combineLatest} from "rxjs";
import {ScrollingService} from "./shared/services/scrolling.service";
import {isPlatformBrowser} from "@angular/common";
import {NotificationService} from "./shared/services/api/user-notification.service";
import {GMapsService} from "./shop/shared/services/gmaps.service";
import {MapsAPILoader} from "@agm/core";

@Component({
	selector: "memo-app",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
	breadcrumbsJsonLd$ = this.router.events.pipe(
		filter(event => event instanceof NavigationEnd),
		distinctUntilChanged(),
		mergeMap(event => this.breadcrumbService.getJsonLd$(this.activatedRoute))
	);

	gaIsInitialized = false;

	onDestroy$ = new EventEmitter<any>();


	isTransparent$ = this.router.events.pipe(
		filter(event => event instanceof NavigationStart),
		map((it: NavigationStart) => it.url === "/")
	);


	constructor(private authService: AuthService,
				private breadcrumbService: BreadcrumbService,
				private cookieConsentService: NgcCookieConsentService,
				private dateAdapter: DateAdapter<Date>,
				private scrollService: ScrollingService,
				private activatedRoute: ActivatedRoute,
				private notificationService: NotificationService,
				private router: Router,
				private __loader: MapsAPILoader,
				@Inject(PLATFORM_ID) private platformId: Object,
				@Inject(LOCALE_ID) public locale: any) {
		dateAdapter.setLocale(locale); // DD.MM.YYYY
	}

	ngOnInit() {
		this.authService.initRefreshToken();
		this.__loader.load();

		this.scrollUpOnPageChange();

		if (isPlatformBrowser(this.platformId)) {
			this.configureAnalyticsCookies();
		}
	}

	scrollUpOnPageChange() {
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd),
			takeUntil(this.onDestroy$)
		).subscribe(event => {
			this.scrollService.scrollToTop();
		});
	}

	configureAnalyticsCookies() {
		//cookie consent/google analytics configuration
		combineLatest([
			this.cookieConsentService.statusChange$.pipe(
				map((event: NgcStatusChangeEvent) => event.status === "allow"),
				startWith(this.cookieConsentService.hasAnswered() && this.cookieConsentService.hasConsented())
			),
			this.router.events
				.pipe(
					filter(event => event instanceof NavigationEnd)
				)
		])
			.pipe(takeUntil(this.onDestroy$))
			.subscribe(([hasConsented, event]: [boolean, NavigationEnd]) => {
				if (!hasConsented) {
					return;
				}

				(this.gaIsInitialized ? Promise.resolve() : insertGoogleAnalyticsHeadScripts())
					.then(() => {
						this.gaIsInitialized = true;

						const url = event.urlAfterRedirects;
						if (url !== null && url !== undefined && url !== "" && url.indexOf("null") < 0) {
							return googleAnalytics(url);
						}
						return Promise.resolve();
					})

			});
	}

	ngOnDestroy(): void {
		this.onDestroy$.emit();
	}
}

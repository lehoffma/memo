import {Component, Inject, LOCALE_ID, OnInit} from "@angular/core";
import {DateAdapter} from "@angular/material";
import {AuthService} from "./shared/authentication/auth.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {distinctUntilChanged, filter, mergeMap} from "rxjs/operators";
import {googleAnalytics} from "../google-analytics-init";
import {BreadcrumbService} from "./shared/breadcrumb-navigation/breadcrumb.service";

@Component({
	selector: "memo-app",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {

	searchJsonLd = {
		"@context": "http://schema.org",
		"@type": "WebSite",
		"url": "https://meilenwoelfe.org/",
		"potentialAction": {
			"@type": "SearchAction",
			"target": "https://meilenwoelfe.org/search?searchTerm=={search_term_string}",
			"query-input": "required name=search_term_string"
		}
	};

	breadcrumbsJsonLd$ = this.router.events.pipe(
		filter(event => event instanceof NavigationEnd),
		distinctUntilChanged(),
		mergeMap(event => this.breadcrumbService.getJsonLd$(this.activatedRoute))
	);

	constructor(private authService: AuthService,
				private breadcrumbService: BreadcrumbService,
				private dateAdapter: DateAdapter<Date>,
				private activatedRoute: ActivatedRoute,
				private router: Router,
				@Inject(LOCALE_ID) public locale: any) {
		dateAdapter.setLocale(locale); // DD.MM.YYYY
	}

	ngOnInit() {
		this.authService.initRefreshToken();

		this.router.events
			.pipe(
				filter(event => event instanceof NavigationEnd)
			)
			.subscribe((event: NavigationEnd) => {
				const url = event.urlAfterRedirects;
				if (url !== null && url !== undefined && url !== "" && url.indexOf("null") < 0) {
					googleAnalytics(url);
				}
			});
	}
}

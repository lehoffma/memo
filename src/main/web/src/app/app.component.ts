import {Component, Inject, LOCALE_ID, OnInit} from "@angular/core";
import {DateAdapter} from "@angular/material";
import {AuthService} from "./shared/authentication/auth.service";
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs/operators";
import {googleAnalytics} from "../google-analytics-init";

@Component({
	selector: "memo-app",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {

	constructor(private authService: AuthService,
				private dateAdapter: DateAdapter<Date>,
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

import {Component, Inject, LOCALE_ID, OnInit} from "@angular/core";
import {DateAdapter} from "@angular/material";
import {AuthService} from "./shared/authentication/auth.service";
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
import {filter} from "rxjs/operators";

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


		this.router.events
			.pipe(
				filter(event => event instanceof NavigationStart || event instanceof NavigationEnd)
			)
			.subscribe((event: NavigationStart | NavigationEnd) => {
				// You only receive NavigationStart events
				console.log(event);
			});
	}

	ngOnInit() {
		this.authService.initRefreshToken();
	}
}

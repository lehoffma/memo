import {Component, Inject, LOCALE_ID, OnInit} from "@angular/core";
import {DateAdapter} from "@angular/material";
import {Moment} from "moment";
import {AuthService} from "./shared/authentication/auth.service";
import {NavigationCancel, Router} from "@angular/router";

@Component({
	selector: "app",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {

	constructor(private authService: AuthService,
				private dateAdapter: DateAdapter<Moment>,
				private router: Router,
				@Inject(LOCALE_ID) public locale: any) {
		dateAdapter.setLocale(locale); // DD.MM.YYYY
	}

	ngOnInit() {
		this.authService.initRefreshToken();
	}
}

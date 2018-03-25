import {Component, OnInit} from "@angular/core";
import {LogInService} from "../../shared/services/api/login.service";
import {Router} from "@angular/router";
import {AuthService} from "../../shared/authentication/auth.service";

@Component({
	selector: "memo-login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
	public email: string = "";
	public password: string = "";

	public loading: boolean = false;
	public error: string = "";

	constructor(private loginService: LogInService,
				public authService: AuthService,
				private router: Router) {
	}

	ngOnInit() {
	}


	/**
	 * Performs a POST request to the server with the entered email and password.
	 * While waiting for the response, a loading icon is displayed (this.loading = true).
	 * If the login was successful, the user is redirected to the url he visited before entering the login process
	 */
	checkLogin() {
		this.loading = true;
		//todo better error handling than "something went wrong"?
		this.loginService.login(this.email, this.password)
			.subscribe(
				loginWasSuccessful => {
					this.loading = false;
					if (!loginWasSuccessful) {
						this.error = "Die eingegebenen Daten sind falsch."
					}
					if (loginWasSuccessful) {
						this.router.navigateByUrl(this.loginService.redirectUrl, {replaceUrl: true});
					}
				},
				error => {
					this.error = "Etwas ist schief gelaufen. Probier es in einigen Momenten noch mal!"
				}
			)
	}
}

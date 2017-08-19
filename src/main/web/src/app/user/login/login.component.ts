import {Component, OnInit} from "@angular/core";
import {LogInService} from "../../shared/services/login.service";
import {NavigationService} from "../../shared/services/navigation.service";

@Component({
	selector: "memo-login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
	public email: string = "";
	public password: string = "";

	public loading: boolean = false;
	public wrongInput: boolean = false;

	constructor(private loginService: LogInService,
				private navigationService: NavigationService) {
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
					this.wrongInput = !loginWasSuccessful;
					if (loginWasSuccessful) {
						this.navigationService.navigateByUrl(this.loginService.redirectUrl)
					}
				},
				error => console.error(error) //todo remove?
			)
	}
}

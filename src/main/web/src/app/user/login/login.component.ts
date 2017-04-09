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

	checkLogin() {
		this.loading = true;
		this.loginService.login(this.email, this.password)
			.subscribe(
				loginWasSuccessful => {
					this.loading = false;
					this.wrongInput = !loginWasSuccessful;
					if (loginWasSuccessful) {
						//todo save which page the user was looking at before logging in and direct him there?
						this.navigationService.navigateByUrl("/")
					}
				},
				error => console.error(error) //todo remove?
			)
	}
}

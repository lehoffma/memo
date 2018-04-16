import {Component, OnInit} from "@angular/core";
import {LogInService} from "../../shared/services/api/login.service";
import {ActivatedRoute} from "@angular/router";
import {first} from "rxjs/operators";
import {AuthService} from "../../shared/authentication/auth.service";
import {JwtHelperService} from "@auth0/angular-jwt";

@Component({
	selector: "memo-confirm-email",
	templateUrl: "./confirm-email.component.html",
	styleUrls: ["./confirm-email.component.scss"]
})
export class ConfirmEmailComponent implements OnInit {

	error: string = "";
	private jwtHelperService: JwtHelperService;

	constructor(private loginService: LogInService,
				private authService: AuthService,
				private activatedRoute: ActivatedRoute) {
		this.jwtHelperService = new JwtHelperService();
	}

	ngOnInit() {
		this.activatedRoute.queryParamMap
			.pipe(
				first()
			)
			.subscribe(map => {
				//todo demo
				const auth_token = map.get("token");

				let isValid = false;
				try {
					isValid = !this.jwtHelperService.isTokenExpired(auth_token)
				}
				catch (e) {
					isValid = false;
				}

				if (auth_token && isValid) {
					this.authService.setAccessToken(auth_token);
					this.loginService.loginFromToken();
				}
				else {
					this.error = "Der Token ist nicht gültig"
				}
			})
	}

}

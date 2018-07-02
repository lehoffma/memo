import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {SignUpService} from "../../user/signup/signup.service";
import {LogInService} from "../services/api/login.service";

@Injectable()
export class SignupWasJustCompletedGuard implements CanActivate {
	constructor(private signUpService: SignUpService,
				private loginService: LogInService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const wasJustCompleted = this.signUpService.signUpWasJustCompleted;

		if (!wasJustCompleted) {
			this.router.navigateByUrl("/");

		}

		return wasJustCompleted;
	}
}

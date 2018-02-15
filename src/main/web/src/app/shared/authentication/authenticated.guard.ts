import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {LogInService} from "../services/api/login.service";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs/Observable";
import {catchError, map} from "rxjs/operators";
import {of} from "rxjs/observable/of";

@Injectable()
export class AuthenticatedGuard implements CanActivate {

	constructor(private loginService: LogInService,
				private authService: AuthService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
		return this.authService.getRefreshedAccessToken()
			.pipe(
				map(token => token.auth_token !== null),
				catchError(() => {
					this.loginService.redirectUrl = state.url;
					this.router.navigate(["login"]);
					return of(false);
				})
			);
	}

}

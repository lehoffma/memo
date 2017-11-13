import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {LogInService} from "../services/api/login.service";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs/Observable";
import {catchError, mergeMap} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import {_throw} from "rxjs/observable/throw";

@Injectable()
export class AuthenticatedGuard implements CanActivate {

	constructor(private loginService: LogInService,
				private authService: AuthService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
		//todo demo remove
		if (state.url.includes("")) {
			console.warn("Authenticated guard demo");
			return true;
		}

		if (this.authService.isAuthenticated()) {
			return true;
		}
		else {
			//try refreshing token
			return this.authService.refreshAccessToken()
				.pipe(
					mergeMap(() => {
						//refreshing token worked
						if (this.authService.isAuthenticated()) {
							return of(true);
						}
						//refreshing token didn't work for some other reason
						return _throw(new Error());
					}),
					//refresh-token expired
					catchError(() => {
						this.loginService.redirectUrl = state.url;
						this.router.navigate(["login"]);
						return of(false);
					})
				)
		}
	}

}

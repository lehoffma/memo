import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {LogInService} from "../services/api/login.service";
import {AuthService} from "./auth.service";
import {Observable, of, throwError} from "rxjs";
import {catchError, mergeMap} from "rxjs/operators";

@Injectable()
export class AuthenticatedGuard implements CanActivate {

	constructor(private loginService: LogInService,
				private authService: AuthService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
		return this.authService.getRefreshedAccessToken()
			.pipe(
				mergeMap(token => {
					const tokenIsValid = token.auth_token !== null;
					if (!tokenIsValid) {
						return throwError(new Error());
					}
					return of(tokenIsValid);
				}),
				catchError(() => {
					// console.log("redirecting")
					this.loginService.redirectUrl = state.url;
					this.router.navigate(["login"]);
					return of(false);
				})
			);
	}

}

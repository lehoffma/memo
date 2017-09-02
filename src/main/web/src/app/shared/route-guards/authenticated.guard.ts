import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {LogInService} from "../services/api/login.service";
import {AuthService} from "../services/api/auth.service";

@Injectable()
export class AuthenticatedGuard implements CanActivate {

	constructor(private loginService: LogInService,
				private authService: AuthService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
		//todo demo remove
		if(state.url.includes("")){
			console.warn("Authenticated guard demo");
			return true;
		}

		if (this.authService.isAuthenticated()) {
			return true;
		}
		else {
			//try refreshing token
			return this.authService.refreshAccessToken()
				.flatMap(response => {
					//refreshing token worked
					if (this.authService.isAuthenticated()) {
						return Observable.of(true);
					}
					//refreshing token didn't work for some other reason
					return Observable.throw(new Error());
				})
				//refresh-token expired
				.catch(error => {
					this.loginService.redirectUrl = state.url;
					this.router.navigate(["login"]);
					return Observable.of(false);
				})
		}
	}

}

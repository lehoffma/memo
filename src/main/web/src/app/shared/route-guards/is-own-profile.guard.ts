import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {LogInService} from "../services/api/login.service";
import {Observable} from "rxjs/Observable";
import {UserService} from "../services/api/user.service";
import {ClubRole, isAuthenticated} from "../model/club-role";
import {NavigationService} from "../services/navigation.service";

@Injectable()
export class IsOwnProfileGuard implements CanActivate {

	constructor(private loginService: LogInService,
				private userService: UserService,
				private navigationService: NavigationService,
				private router: Router) {
	}


	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
		return this.loginService.accountObservable
			.flatMap(currentUserId => {
				const routeId: number = +route.paramMap.get("id");
				let isAllowed = Observable.of(false);

				if (currentUserId !== null) {
					isAllowed = this.userService.getById(routeId)
						.map(user => currentUserId === routeId || isAuthenticated(user.clubRole, ClubRole.Admin))
				}
				//redirect to login if the user isn't logged in
				else {
					this.loginService.redirectUrl = state.url;
					this.navigationService.navigateByUrl("login");
				}
				return isAllowed.do(isAllowed => isAllowed
					? null
					: this.navigationService.navigateByUrl("not-allowed"));
			});
	}
}

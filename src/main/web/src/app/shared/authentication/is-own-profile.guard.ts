import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from "@angular/router";
import {LogInService} from "../services/api/login.service";
import {UserService} from "../services/api/user.service";
import {ClubRole, isAuthenticated} from "../model/club-role";
import {NavigationService} from "../services/navigation.service";
import {Observable, of} from "rxjs";
import {map, mergeMap} from "rxjs/operators";
import {userPermissions} from "../model/user";
import {Permission} from "../model/permission";

@Injectable()
export class IsOwnProfileGuard implements CanActivate {

	constructor(private loginService: LogInService,
				private userService: UserService,
				private navigationService: NavigationService) {
	}


	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
		return this.loginService
			.accountObservable
			.pipe(
				mergeMap(id => id === null ? of(null) : this.userService.getById(id)),
				map(currentUser => {
					const routeId: number = +route.paramMap.get("id");
					let isAllowed = false;

					if (currentUser !== null) {
						let permissions = userPermissions(currentUser);
						isAllowed = currentUser.id === routeId || isAuthenticated(currentUser.clubRole, ClubRole.Mitglied)
							|| permissions.userManagement >= Permission.read;
					}
					//redirect to login if the user isn't logged in
					else {
						this.loginService.redirectUrl = state.url;
						this.navigationService.navigateByUrl("login");
					}

					if (!isAllowed) {
						this.navigationService.navigateByUrl("not-allowed")
					}
					return isAllowed;
				})
			);
	}
}

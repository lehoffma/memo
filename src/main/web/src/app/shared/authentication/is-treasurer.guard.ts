import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {LogInService} from "../services/api/login.service";
import {ClubRole, isAuthenticated} from "../model/club-role";
import {Permission} from "../model/permission";
import {UserService} from "../services/api/user.service";
import {Observable, of} from "rxjs";
import {map, mergeMap} from "rxjs/operators";
import {userPermissions} from "../model/user";

@Injectable()
export class IsTreasurerGuard implements CanActivate {
	constructor(private loginService: LogInService,
				private userService: UserService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return this.loginService
			.accountObservable
			.pipe(
				mergeMap(id => id === null ? of(null) : this.userService.getById(id)),
				map(user => {
					if (user === null) {
						this.loginService.redirectUrl = state.url;
						this.router.navigate(["login"]);
						return false;
					}
					let permissions = userPermissions(user);

					if (permissions.funds >= Permission.read) {
						return true;
					}
					if (isAuthenticated(user.clubRole, ClubRole.Kassenwart)) {
						return true;
					}

					this.router.navigate(["not-allowed"]);
					return false;
				})
			);
	}
}

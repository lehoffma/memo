import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {LogInService} from "../services/api/login.service";
import {ClubRole, isAuthenticated, rolePermissions} from "../model/club-role";
import {Permission} from "../model/permission";
import {UserService} from "../services/api/user.service";

@Injectable()
export class IsTreasurerGuard implements CanActivate {
	constructor(private loginService: LogInService,
				private userService: UserService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return this.loginService
			.accountObservable
			.flatMap(id => id === null ? Observable.of(null) : this.userService.getById(id))
			.map(user => {
				if (user === null) {
					this.loginService.redirectUrl = state.url;
					this.router.navigate(["login"]);
					return false;
				}
				let defaultPermissions = rolePermissions[user.clubRole];
				let userPermissions = user.userPermissions;

				if (defaultPermissions.funds > Permission.read || userPermissions.funds > Permission.read) {
					return true;
				}
				if (isAuthenticated(user.clubRole, ClubRole.Kassenwart)) {
					return true;
				}

				this.router.navigate(["not-allowed"]);
				return false;
			})
	}
}

import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {LogInService} from "../services/api/login.service";
import {ClubRole, isAuthenticated, rolePermissions} from "../model/club-role";
import {Permission} from "../model/permission";
import {UserService} from "../services/api/user.service";
import {Observable} from "rxjs/Observable";
import {of} from "rxjs/observable/of";
import {combineLatest, map, mergeMap} from "rxjs/operators";

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
					let userPermissions = user.userPermissions();

					if (userPermissions.funds >= Permission.read) {
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

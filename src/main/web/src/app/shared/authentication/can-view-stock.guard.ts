import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {LogInService} from "../services/api/login.service";
import {ClubRole, isAuthenticated, rolePermissions} from "../model/club-role";
import {Permission} from "../model/permission";
import {UserService} from "../services/api/user.service";
import {Observable} from "rxjs/Observable";
import {of} from "rxjs/observable/of";
import {map, mergeMap} from "rxjs/operators";
import {User} from "../model/user";

@Injectable()
export class CanViewStockGuard implements CanActivate {
	constructor(private loginService: LogInService,
				private userService: UserService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return this.loginService
			.accountObservable
			.pipe(
				mergeMap(id => id === null ? of(null) : this.userService.getById(id)),
				map((user: User) => {
					if (user === null) {
						this.loginService.redirectUrl = state.url;
						this.router.navigate(["login"]);
						return false;
					}
					const userPermissions = user.userPermissions;

					if (userPermissions.stock > Permission.read) {
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

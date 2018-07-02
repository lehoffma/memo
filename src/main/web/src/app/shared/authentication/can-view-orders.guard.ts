import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {LogInService} from "../services/api/login.service";
import {UserService} from "../services/api/user.service";
import {ClubRole, isAuthenticated} from "../model/club-role";
import {of} from "rxjs";
import {User, userPermissions} from "../model/user";
import {map, mergeMap} from "rxjs/operators";
import {Permission} from "../model/permission";

@Injectable()
export class CanViewOrdersGuard implements CanActivate {
	constructor(private loginService: LogInService,
				private userService: UserService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
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
					const permissions = userPermissions(user);

					if (permissions.stock > Permission.read) {
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

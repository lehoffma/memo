import {Injectable} from "@angular/core";
import {map, mergeMap} from "rxjs/operators";
import {ClubRole, isAuthenticated} from "../model/club-role";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable, of} from "rxjs";
import {UserService} from "../services/api/user.service";
import {LogInService} from "../services/api/login.service";

@Injectable()
export class IsBoardMemberGuard implements CanActivate {
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
					if (isAuthenticated(user.clubRole, ClubRole.Vorstand)) {
						return true;
					}

					this.router.navigate(["not-allowed"]);
					return false;
				})
			);
	}
}

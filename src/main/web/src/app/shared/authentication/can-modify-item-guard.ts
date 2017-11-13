import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {LogInService} from "../services/api/login.service";
import {EventService} from "../services/api/event.service";
import {EntryService} from "../services/api/entry.service";
import {UserService} from "../services/api/user.service";
import {Permission} from "../model/permission";
import {ShopItem} from "../model/shop-item";
import {rolePermissions} from "../model/club-role";
import {Observable} from "rxjs/Observable";
import {map, mergeMap, tap} from "rxjs/operators";
import {of} from "rxjs/observable/of";

@Injectable()
export class CanModifyItemGuard implements CanActivate {
	constructor(private loginService: LogInService,
				private eventService: EventService,
				private entryService: EntryService,
				private userService: UserService,
				private router: Router) {
	}

	getShopItemFromRoute(route: ActivatedRouteSnapshot, id: number) {
		let permissionKey = "";
		let shopItem = of(null);
		switch (route.paramMap.get("itemType")) {
			case "tours":
				if (id >= 0) {
					shopItem = this.eventService.getById(id);
				}
				permissionKey = "tour";
				break;
			case "partys":
				if (id >= 0) {
					shopItem = this.eventService.getById(id);
				}
				permissionKey = "party";
				break;
			case "merch":
				if (id >= 0) {
					shopItem = this.eventService.getById(id);
				}
				permissionKey = "merch";
				break;
			case "members":
				if (id >= 0) {
					shopItem = this.userService.getById(id);
				}
				permissionKey = "user";
				break;
			case "entries":
				if (id >= 0) {
					shopItem = this.entryService.getById(id);
				}
				permissionKey = "funds";
				break;
		}
		return {permissionKey, shopItem}
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

		return this.loginService
			.accountObservable
			.pipe(
				mergeMap(id => id === null ? of(null) : this.userService.getById(id)),
				mergeMap(user => {
					if (user === null) {
						this.loginService.redirectUrl = state.url;
						this.router.navigate(["login"]);
						return of(false);
					}

					let id = route.paramMap.has("id") ? +route.paramMap.get("id") : -1;
					const {permissionKey, shopItem} = this.getShopItemFromRoute(route, id);
					let permissions = user.permissions ? user.permissions : rolePermissions[user.clubRole];

					return shopItem
						.pipe(
							map(item => {
								//todo update once the item supports special user rights
								if (item === null) {
									return permissions[permissionKey] >= Permission.create;
								}
								return permissions[permissionKey] >= Permission.write;
							}),
							tap(isAuthenticated => {
								if (!isAuthenticated) {
									this.router.navigate(["not-allowed"]);
								}
							})
						)
				})
			)
	}

}

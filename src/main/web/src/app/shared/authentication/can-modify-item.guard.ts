import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {LogInService} from "../services/api/login.service";
import {EventService} from "../services/api/event.service";
import {EntryService} from "../services/api/entry.service";
import {UserService} from "../services/api/user.service";
import {Permission} from "../model/permission";
import {isAuthenticated, rolePermissions} from "../model/club-role";
import {Observable} from "rxjs/Observable";
import {map, mergeMap, tap} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import {ShopItem} from "../model/shop-item";
import {Event} from "../../shop/shared/model/event";
import {User} from "../model/user";
import {ShopItemGuardHelper} from "./shop-item-guard.helper";

@Injectable()
export class CanModifyItemGuard implements CanActivate {
	constructor(private loginService: LogInService,
				private shopItemGuardHelper: ShopItemGuardHelper,
				private eventService: EventService,
				private entryService: EntryService,
				private userService: UserService,
				private router: Router) {
	}

	getShopItemFromRoute(route: ActivatedRouteSnapshot, id: number): { permissionKey: string, shopItem: Observable<ShopItem | Event> } {
		let permissionKey = this.shopItemGuardHelper.getPermissionKeyFromType(route.paramMap.get("itemType") || "orders");
		let shopItem: Observable<ShopItem | Event> = of(null);
		const service = this.shopItemGuardHelper.getServletServiceFromType(route.paramMap.get("itemType") || "orders");
		if (service !== null && id >= 0) {
			shopItem = service.getById(id);
		}

		return {permissionKey, shopItem}
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
		return this.loginService
			.accountObservable
			.pipe(
				mergeMap(id => id === null ? of(null) : this.userService.getById(id)),
				mergeMap((user: User) => {
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
								if (item === null) {
									return permissions[permissionKey] >= Permission.create;
								}
								if (Event.isEvent(item)) {
									return isAuthenticated(user.clubRole, item.expectedWriteRole) ||
										permissions[permissionKey] >= Permission.write;
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

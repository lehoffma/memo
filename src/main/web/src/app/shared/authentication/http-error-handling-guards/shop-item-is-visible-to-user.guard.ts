import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {ShopItem} from "../../model/shop-item";
import {ShopItemGuardHelper} from "../shop-item-guard.helper";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {ObjectIsVisibleToUserGuard} from "./object-is-visible-to-user.guard";

@Injectable()
export class ShopItemIsVisibleToUserGuard extends ObjectIsVisibleToUserGuard<ShopItem> implements CanActivate {
	constructor(protected router: Router,
				private shopItemGuardHelper: ShopItemGuardHelper) {
		super(router);
	}

	getRequest(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ShopItem> {
		return this.shopItemGuardHelper.getRequest(route, state, 403);
	}
}

import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {ShopItem} from "../../model/shop-item";
import {Observable} from "rxjs";
import {ObjectExistsGuard} from "./object-exists.guard";
import {ShopItemGuardHelper} from "../shop-item-guard.helper";

@Injectable()
export class ShopItemExistsGuard extends ObjectExistsGuard<ShopItem> implements CanActivate {
	constructor(protected router: Router,
				private shopItemGuardHelper: ShopItemGuardHelper) {
		super(router);
	}

	getRequest(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ShopItem> {
		return this.shopItemGuardHelper.getRequest(route, state, 404);
	}
}

import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {ShopItemType} from "../../shop/shared/model/shop-item-type";
import {isNullOrUndefined} from "util";

@Injectable()
export class IsValidItemTypeGuard implements CanActivate {
	constructor(private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const itemType = route.params["itemType"];

		if (isNullOrUndefined(itemType) || isNullOrUndefined(ShopItemType[ShopItemType[itemType]])) {
			this.router.navigate(["/page-not-found"]);
			return false;
		}
		return true;
	}
}

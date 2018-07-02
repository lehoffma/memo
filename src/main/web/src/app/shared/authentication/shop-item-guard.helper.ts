import {Injectable} from "@angular/core";
import {ServletService} from "../services/api/servlet.service";
import {UserService} from "../services/api/user.service";
import {EntryService} from "../services/api/entry.service";
import {EventService} from "../services/api/event.service";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Observable, throwError} from "rxjs";
import {ShopItem} from "../model/shop-item";
import {OrderService} from "../services/api/order.service";

@Injectable()
export class ShopItemGuardHelper {

	constructor(
		private eventService: EventService,
		private userService: UserService,
		private entryService: EntryService,
		private orderService: OrderService
	) {
	}

	public getPermissionKeyFromType(itemType: string): string {
		switch (itemType) {
			case "tours":
				return "tour";
			case "partys":
				return "party";
			case "merch":
				return "merch";
			case "members":
				return "userManagement";
			case "orders":
			case "entries":
				return "funds";
		}
		return "";
	}

	public getServletServiceFromType(itemType: string): ServletService<any> {
		switch (itemType) {
			case "tours":
			case "merch":
			case "partys":
				return this.eventService;
			case "members":
				return this.userService;
			case "entries":
				return this.entryService;
			case "orders":
				return this.orderService;
		}
		return null;
	}

	public getItemTypeFromRoute(route: ActivatedRouteSnapshot) {
		const possibleTypes = ["tours", "merch", "partys", "members", "entries", "orders"];
		let itemType = route.paramMap.get("itemType");
		if (itemType === null) {
			let type = possibleTypes.find(type => route.toString().includes(type));
			if (!type) {
				return null;
			}
			itemType = type;
		}
		return itemType;
	}


	public getRequest(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, statusCode: number): Observable<ShopItem> {
		let id = route.paramMap.has("id") ? +route.paramMap.get("id") : -1;
		if (id === -1) {
			return throwError({status: statusCode});
		}
		return this.getServletServiceFromType(this.getItemTypeFromRoute(route)).getById(id);
	}
}

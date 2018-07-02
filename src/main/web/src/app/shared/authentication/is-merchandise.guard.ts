import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {EventService} from "../services/api/event.service";
import {EventUtilityService} from "../services/event-utility.service";
import {map, tap} from "rxjs/operators";

@Injectable()
export class IsMerchandiseGuard implements CanActivate {
	constructor(private eventService: EventService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		let itemType;
		if (route.paramMap.has("itemType")) {
			itemType = route.paramMap.get("itemType");
		}
		if (route.toString().includes("merch")) {
			itemType = "merch";
		}
		let id = route.paramMap.has("id") ? route.paramMap.get("id") : -1;

		if (id >= 0 && itemType === "merch") {
			return this.eventService.getById(+id)
				.pipe(
					map(event => EventUtilityService.isMerchandise(event)),
					tap(isMerch => {
						if (!isMerch) {
							this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true});
						}
					})
				);
		}

		return false;
	}
}

import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {OrderService} from "../../shared/services/api/order.service";

@Injectable()
export class CompletedOrderGuard implements CanActivate {
	constructor(private orderService: OrderService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const userCompletedOrder = this.orderService.completedOrder !== null;

		if (!userCompletedOrder) {
			this.router.navigate([""])
		}

		return userCompletedOrder;
	}
}

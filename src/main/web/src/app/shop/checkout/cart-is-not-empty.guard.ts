import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {ShoppingCartService} from "../../shared/services/shopping-cart.service";
import {map, tap} from "rxjs/operators";

@Injectable()
export class CartIsNotEmptyGuard implements CanActivate {
	constructor(private cartService: ShoppingCartService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return this.cartService.amountOfCartItems
			.pipe(
				map(amount => amount > 0),
				tap(isNotEmpty => {
					if (!isNotEmpty) {
						this.router.navigateByUrl("/");
					}
				})
			)
	}
}

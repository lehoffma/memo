import {ModuleWithProviders, NgModule} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {AuthInterceptor} from "./auth.interceptor";
import {AuthenticatedGuard} from "./authenticated.guard";
import {CanModifyItemGuard} from "./can-modify-item-guard";
import {IsOwnProfileGuard} from "./is-own-profile.guard";
import {IsTreasurerGuard} from "./is-treasurer.guard";
import {IsValidItemTypeGuard} from "./is-valid-itemtype.guard";
import {CanViewStockGuard} from "./can-view-stock.guard";
import {ShopItemExistsGuard} from "./http-error-handling-guards/shop-item-exists.guard";
import {ShopItemIsVisibleToUserGuard} from "./http-error-handling-guards/shop-item-is-visible-to-user.guard";
import {ShopItemGuardHelper} from "./shop-item-guard.helper";


const providers = [
	AuthService,
	AuthInterceptor,
	AuthenticatedGuard,
	CanModifyItemGuard,
	CanViewStockGuard,
	IsOwnProfileGuard,
	IsTreasurerGuard,
	IsValidItemTypeGuard,
	ShopItemExistsGuard,
	ShopItemIsVisibleToUserGuard,
];

@NgModule({
	imports: [HttpClientModule],
	providers: [ShopItemGuardHelper]
})
export class AuthenticationModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: AuthenticationModule,
			providers
		}
	}
}

import {ModuleWithProviders, NgModule} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {AuthService} from "./authentication/auth.service";
import {AuthInterceptor} from "./authentication/auth.interceptor";
import {AuthenticatedGuard} from "./authentication/authenticated.guard";
import {CanModifyItemGuard} from "./authentication/can-modify-item-guard";
import {IsOwnProfileGuard} from "./authentication/is-own-profile.guard";
import {IsTreasurerGuard} from "./authentication/is-treasurer.guard";
import {IsValidItemTypeGuard} from "./authentication/is-valid-itemtype.guard";
import {CanViewStockGuard} from "./authentication/can-view-stock.guard";


const providers = [
	AuthService,
	AuthInterceptor,
	AuthenticatedGuard,
	CanModifyItemGuard,
	CanViewStockGuard,
	IsOwnProfileGuard,
	IsTreasurerGuard,
	IsValidItemTypeGuard
];

@NgModule({
	imports: [HttpClientModule]
})
export class AuthenticationModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: AuthenticationModule,
			providers
		}
	}
}

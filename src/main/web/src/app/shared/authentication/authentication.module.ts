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
	imports: [HttpClientModule],
})
export class AuthenticationModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: AuthenticationModule,
			providers
		}
	}
}

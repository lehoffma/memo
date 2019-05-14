import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ModifyShopItemComponent} from "./modify-shop-item.component";
import {IsValidItemTypeGuard} from "../../../shared/authentication/is-valid-itemtype.guard";
import {CanModifyItemGuard} from "../../../shared/authentication/can-modify-item.guard";
import {ModifyUserComponent} from "./modify-user/modify-user.component";
import {AuthenticatedGuard} from "../../../shared/authentication/authenticated.guard";
import {IsOwnProfileGuard} from "../../../shared/authentication/is-own-profile.guard";
import {IsMerchandiseGuard} from "../../../shared/authentication/is-merchandise.guard";
import {ModifyMerchStockContainerComponent} from "./modify-merch/modify-merch-stock-container/modify-merch-stock-container.component";
import {ShopItemExistsGuard} from "../../../shared/authentication/http-error-handling-guards/shop-item-exists.guard";
import {ShopItemIsVisibleToUserGuard} from "../../../shared/authentication/http-error-handling-guards/shop-item-is-visible-to-user.guard";
import {ModifyOrderComponent} from "./modify-order/modify-order.component";


//todo break up modify stuff into other modules
const routes: Routes = [
	{
		path: "management/create/orders", component: ModifyOrderComponent, pathMatch: "full", canActivate: [
			AuthenticatedGuard, CanModifyItemGuard
		]
	},
	{
		path: "management/orders/:id/edit", component: ModifyOrderComponent, pathMatch: "full", canActivate: [
			AuthenticatedGuard, CanModifyItemGuard, ShopItemIsVisibleToUserGuard
		]
	},

	{
		path: "management/stock/:itemType/:id/edit", component: ModifyMerchStockContainerComponent,
		pathMatch: "full",
		canActivate: [AuthenticatedGuard, CanModifyItemGuard, IsMerchandiseGuard,
			ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]
	},

	//nur eingeloggte user, die die Tour erstellt haben oder Organisator oder Admin sind
	{
		path: "shop/:itemType/:id/edit",
		component: ModifyShopItemComponent,
		pathMatch: "full",
		canActivate: [IsValidItemTypeGuard, CanModifyItemGuard,
			ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]
	},
	{
		path: "shop/create/:itemType",
		component: ModifyShopItemComponent,
		pathMatch: "full",
		canActivate: [IsValidItemTypeGuard, CanModifyItemGuard]
	},
	//todo
	{
		path: "club/:itemType/:id/edit",
		component: ModifyShopItemComponent,
		pathMatch: "full",
		canActivate: [IsValidItemTypeGuard, CanModifyItemGuard,
			ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]
	},
	{
		path: "club/create/:itemType",
		component: ModifyShopItemComponent,
		pathMatch: "full",
		canActivate: [IsValidItemTypeGuard, CanModifyItemGuard]
	},

	{
		path: "shop/:itemType/:eventId/costs/:id/edit",
		component: ModifyShopItemComponent,
		pathMatch: "full",
		canActivate: [/*todo is-event guard*/ CanModifyItemGuard,
			ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]
	},
	{
		path: "shop/:itemType/:eventId/costs/create",
		component: ModifyShopItemComponent,
		pathMatch: "full",
		canActivate: [/*todo is-event guard*/ CanModifyItemGuard,
			ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]
	},
	//todo should probably be restructured
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	providers: [
		IsValidItemTypeGuard,
		CanModifyItemGuard,
		AuthenticatedGuard,
		IsOwnProfileGuard,
		IsMerchandiseGuard
	],
	exports: [RouterModule],
})
export class ModifyShopItemRoutingModule {
}

export const routedComponents = [ModifyShopItemComponent, ModifyUserComponent,
	ModifyMerchStockContainerComponent, ModifyOrderComponent];

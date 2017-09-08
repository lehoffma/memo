import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ModifyShopItemComponent} from "./modify-shop-item.component";
import {IsValidItemTypeGuard} from "../../../shared/authentication/is-valid-itemtype.guard";
import {CanModifyItemGuard} from "../../../shared/authentication/can-modify-item-guard";
import {ModifyUserComponent} from "./modify-user/modify-user.component";
import {AuthenticatedGuard} from "../../../shared/authentication/authenticated.guard";
import {IsOwnProfileGuard} from "../../../shared/authentication/is-own-profile.guard";


const routes: Routes = [
	//todo implement
	//nur eingeloggte user, die die Tour erstellt haben oder Organizer oder Admin sind
	{
		path: ":itemType/:id/edit",
		component: ModifyShopItemComponent,
		canActivate: [IsValidItemTypeGuard, CanModifyItemGuard]
	},
	{
		path: ":itemType/create",
		component: ModifyShopItemComponent,
		canActivate: [IsValidItemTypeGuard, CanModifyItemGuard]
	},

	{
		path: ":itemType/:eventId/costs/:id/edit",
		component: ModifyShopItemComponent,
		canActivate: [/*todo is-event guard*/ CanModifyItemGuard]
	},
	{
		path: ":itemType/:eventId/costs/create",
		component: ModifyShopItemComponent,
		canActivate: [/*todo is-event guard*/ CanModifyItemGuard]
	},
	{path: "members/:id/edit", component: ModifyUserComponent, canActivate: [AuthenticatedGuard, IsOwnProfileGuard]},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	providers: [
		IsValidItemTypeGuard,
		CanModifyItemGuard,
		AuthenticatedGuard,
		IsOwnProfileGuard
	],
	exports: [RouterModule],
})
export class ModifyShopItemRoutingModule {
}

export const routedComponents = [ModifyShopItemComponent, ModifyUserComponent];

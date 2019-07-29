import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {routedComponents, ShopItemDetailsRoutingModule} from "../shop-item-details.routing";
import {RouteMapComponent} from "./route/route-map.component";
import {FullNameTableCellComponent} from "./participants/participant-list/full-name-table-cell.component";
import {ParticipantsComponent} from "./participants/participants.component";
import {ModifyParticipantComponent} from "./participants/participant-list/modify-participant/modify-participant.component";
import {ClothesSizePipe} from "./details/clothes-size.pipe";
import {ItemInfoComponent} from "./info/item-info.component";
import {ItemImagePopupComponent} from "./image-popup/item-image-popup.component";
import {CommentsSectionModule} from "./comments-section/comments-section.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MemoMaterialModule} from "../../../../material.module";
import {SharedModule} from "../../../shared/shared.module";
import {AgmCoreModule} from "@agm/core";
import {OrderStatusTableCellComponent} from "./participants/order-status-table-cell.component";
import {RouteListComponent} from "./route/route-list.component";
import {AddressRendererPipe} from "./route/address-renderer.pipe";
import {SharedShopModule} from "../../shared/shop-shared.module";
import {ShareButtonsModule} from "@ngx-share/buttons";
import {ItemInfoHeaderComponent} from "./item-info-header/item-info-header.component";
import {AddToCartFormComponent} from "./add-to-cart-form/add-to-cart-form.component";
import {DetailPageComponent} from "./details/detail-page.component";
import {MilesPipe} from "./participants/miles.pipe";
import {ManageWaitingListDialogComponent} from "./add-to-cart-form/manage-waiting-list-dialog.component";
import {SharedCheckoutModule} from "../../checkout/shared-checkout.module";
import {ParticipantsModule} from "./participants/participant-list/participants.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {ItemOrderInfoComponent} from "./order-info/item-order-info.component";
import { ItemOrderInfoLinkComponent } from './order-info/item-order-info-link/item-order-info-link.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MemoMaterialModule,
		ShareButtonsModule,
		SharedModule,
		SharedShopModule,
		SharedCheckoutModule,
		AgmCoreModule,
		ShopItemDetailsRoutingModule,
		ParticipantsModule,
		CommentsSectionModule,
		FlexLayoutModule
	],
	declarations: [
		routedComponents,
		DetailPageComponent,
		RouteMapComponent,

		FullNameTableCellComponent,
		ParticipantsComponent,
		ModifyParticipantComponent,

		ClothesSizePipe,
		AddressRendererPipe,

		ItemInfoComponent,
		ItemImagePopupComponent,
		OrderStatusTableCellComponent,
		RouteListComponent,
		ItemInfoHeaderComponent,
		AddToCartFormComponent,
		MilesPipe,
		ManageWaitingListDialogComponent,
		ItemOrderInfoComponent,
		ItemOrderInfoLinkComponent,
	],
	entryComponents: [
		FullNameTableCellComponent,
		ItemImagePopupComponent,
		ModifyParticipantComponent,
		OrderStatusTableCellComponent,
		ManageWaitingListDialogComponent,
	],
	exports: [
		ItemImagePopupComponent,
	]
})
export class ShopItemDetailsModule {
}

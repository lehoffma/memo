import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {routedComponents, ShopItemDetailsRoutingModule} from "../shop-item-details.routing";
import {RouteMapComponent} from "./route/route-map.component";
import {FullNameTableCellComponent} from "./participants/participant-list/full-name-table-cell.component";
import {ParticipantsComponent} from "./participants/participants.component";
import {ModifyParticipantComponent} from "./participants/participant-list/modify-participant/modify-participant.component";
import {ItemTableComponent} from "./details-table/item-table.component";
import {ClothesSizePipe} from "./details/clothes-size.pipe";
import {ItemDetailsContentComponent} from "./content/item-details-content.component";
import {ItemDetailsContainerComponent} from "./container/item-details-container.component";
import {ItemInfoComponent} from "./info/item-info.component";
import {ItemImagePopupComponent} from "./container/image-popup/item-image-popup.component";
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
import { MilesPipe } from './participants/miles.pipe';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MemoMaterialModule,
		ShareButtonsModule,
		SharedModule,
		SharedShopModule,
		AgmCoreModule,
		ShopItemDetailsRoutingModule,
		CommentsSectionModule
	],
	declarations: [
		routedComponents,
		DetailPageComponent,
		RouteMapComponent,

		FullNameTableCellComponent,
		ParticipantsComponent,
		ModifyParticipantComponent,

		ItemTableComponent,

		ClothesSizePipe,
		AddressRendererPipe,

		ItemDetailsContentComponent,
		ItemDetailsContainerComponent,
		ItemInfoComponent,
		ItemImagePopupComponent,
		OrderStatusTableCellComponent,
		RouteListComponent,
		ItemInfoHeaderComponent,
		AddToCartFormComponent,
		MilesPipe,
	],
	entryComponents: [
		FullNameTableCellComponent,
		ItemImagePopupComponent,
		ModifyParticipantComponent,
		OrderStatusTableCellComponent
	],
	exports: [
		ItemDetailsContentComponent,
		ItemImagePopupComponent,
	]
})
export class ShopItemDetailsModule {
}

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {routedComponents, ShopItemDetailsRoutingModule} from "../shop-item-details.routing";
import {SizeTableComponent} from "./size-table/size-table.component";
import {RouteComponent} from "./route/route.component";
import {FullNameTableCellComponent} from "./participants/participant-list/full-name-table-cell.component";
import {ParticipantsComponent} from "./participants/participants.component";
import {ModifyParticipantComponent} from "./participants/participant-list/modify-participant/modify-participant.component";
import {ItemTableComponent} from "./details-table/item-table.component";
import {ClothesSizePipe} from "./details/clothes-size.pipe";
import {ItemDetailsContentComponent} from "./content/item-details-content.component";
import {ItemDetailsContainerComponent} from "./container/item-details-container.component";
import {ShareButtonsModule} from "ngx-sharebuttons";
import {ItemDetailsOverviewComponent} from "./container/overview/item-details-overview.component";
import {ItemImagePopupComponent} from "./container/image-popup/item-image-popup.component";
import {CommentsSectionModule} from "./comments-section/comments-section.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MemoMaterialModule} from "../../../../material.module";
import {SharedModule} from "../../../shared/shared.module";
import {AgmCoreModule} from "@agm/core";
import { OrderStatusTableCellComponent } from './participants/order-status-table-cell.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MemoMaterialModule,
		ShareButtonsModule,
		SharedModule,
		AgmCoreModule,
		ShopItemDetailsRoutingModule,
		CommentsSectionModule
	],
	declarations: [
		routedComponents,
		SizeTableComponent,
		RouteComponent,

		FullNameTableCellComponent,
		ParticipantsComponent,
		ModifyParticipantComponent,

		ItemTableComponent,

		ClothesSizePipe,

		ItemDetailsContentComponent,
		ItemDetailsContainerComponent,
		ItemDetailsOverviewComponent,
		ItemImagePopupComponent,
		OrderStatusTableCellComponent,
	],
	entryComponents: [
		FullNameTableCellComponent,
		ItemImagePopupComponent,
		ModifyParticipantComponent,
		OrderStatusTableCellComponent
	],
	exports: [
		ItemDetailsContentComponent
	]
})
export class ShopItemDetailsModule {
}

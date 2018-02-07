import {NgModule} from "@angular/core";
import {ExpandableTableModule} from "./expandable-table/expandable-table.module";
import {MomentPipe} from "./pipes/moment.pipe";
import {MultiLevelSelectModule} from "./multi-level-select/multi-level-select.module";
import {EventCalendarComponent} from "./event-calendar/event-calendar.component";
import {CommonModule} from "@angular/common";
import {ScheduleModule} from "primeng/primeng";
import {BadgeComponent} from "./badge/badge.component";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {ErrorPageComponent} from "./error-page/error-page.component";
import {AutoSizeTextAreaDirective} from "./autosize-textarea.directive";
import {ConfirmationDialogComponent} from "./confirmation-dialog/confirmation-dialog.component";
import {MemoMaterialModule} from "../../material.module";
import {ModifyItemInnerContainerComponent} from "./modify-item-inner-container/modify-item-inner-container.component";
import {MultiImageUploadComponent} from "./multi-image-upload/multi-image-upload.component";
import {MultiImageContainerComponent} from "./multi-image-container/multi-image-container.component";
import {PriceRendererComponent} from "./price-renderer/price-renderer.component";
import {RouterModule} from "@angular/router";
import {ProfileLinkComponent} from "./profile-renderer/profile-link/profile-link.component";
import {ProfilePreviewComponent} from "./profile-renderer/profile-preview/profile-preview.component";
import {CapacityRendererComponent} from "./capacity-renderer/capacity-renderer.component";
import {ShareDialogComponent} from "./share-dialog/share-dialog.component";
import {UserAutocompleteComponent} from "./user-autocomplete/user-autocomplete.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ShareButtonsModule} from "@ngx-share/buttons";
import {DisplayErrorDirective} from "./template-validators/display-error.directive";

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
		ShareButtonsModule,
		ScheduleModule,
		ExpandableTableModule,
		MemoMaterialModule,
		MultiLevelSelectModule,
	],
	declarations: [
		MomentPipe,
		EventCalendarComponent,

		ConfirmationDialogComponent,

		ModifyItemInnerContainerComponent,

		BadgeComponent,
		PageNotFoundComponent,
		ErrorPageComponent,
		AutoSizeTextAreaDirective,
		MultiImageUploadComponent,
		MultiImageContainerComponent,
		PriceRendererComponent,

		ProfileLinkComponent,
		ProfilePreviewComponent,
		CapacityRendererComponent,
		ShareDialogComponent,
		UserAutocompleteComponent,
		DisplayErrorDirective
	],
	exports: [
		ExpandableTableModule,
		MultiLevelSelectModule,

		EventCalendarComponent,

		ModifyItemInnerContainerComponent,

		BadgeComponent,
		PageNotFoundComponent,
		ErrorPageComponent,

		MomentPipe,

		AutoSizeTextAreaDirective,

		ShareDialogComponent,

		MultiImageUploadComponent,
		MultiImageContainerComponent,

		PriceRendererComponent,

		ProfileLinkComponent,

		CapacityRendererComponent,
		UserAutocompleteComponent,

		DisplayErrorDirective
	],
	entryComponents: [
		ConfirmationDialogComponent,
		ProfilePreviewComponent,
		ShareDialogComponent
	]
})
export class SharedModule {
}

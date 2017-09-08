

import {ModuleWithProviders, NgModule} from "@angular/core";
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

@NgModule({
	imports: [
		CommonModule,
		ScheduleModule,
		ExpandableTableModule,
		MemoMaterialModule,
		MultiLevelSelectModule,
	],
	declarations: [
		MomentPipe,
		EventCalendarComponent,

		ConfirmationDialogComponent,

		BadgeComponent,
		PageNotFoundComponent,
		ErrorPageComponent,
		AutoSizeTextAreaDirective
	],
	exports: [
		ExpandableTableModule,
		MultiLevelSelectModule,

		EventCalendarComponent,

		BadgeComponent,
		PageNotFoundComponent,
		ErrorPageComponent,

		MomentPipe,

		AutoSizeTextAreaDirective
	],
	entryComponents: [
		ConfirmationDialogComponent,
	]
})
export class SharedModule{}

import {NgModule} from "@angular/core";

import {EventCalendarContainerComponent} from "./event-calendar-container.component";
import {CreateEventContextMenuComponent} from "./create-event-context-menu/create-event-context-menu.component";
import {EventContextMenuComponent} from "./event-context-menu/event-context-menu.component";
import {EventCalendarContainerComponentRoutingModule, routedComponents} from "./event-calendar-container.routing";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {MemoMaterialModule} from "../../../material.module";
import {FormsModule} from "@angular/forms";
import {EventListViewComponent} from "./event-list-view/event-list-view.component";
import {SearchModule} from "../search-results/search.module";
import { RemoveDuplicatesPipe } from './event-context-menu/remove-duplicates.pipe';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		FormsModule,
		MemoMaterialModule,
		SearchModule,
		EventCalendarContainerComponentRoutingModule
	],
	exports: [EventCalendarContainerComponent],
	declarations: [
		routedComponents,
		EventContextMenuComponent,
		CreateEventContextMenuComponent,
		EventListViewComponent,
		RemoveDuplicatesPipe
	],

	entryComponents: [
		EventContextMenuComponent,
		CreateEventContextMenuComponent
	]
})
export class EventCalendarContainerModule {
}

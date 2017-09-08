import {NgModule} from '@angular/core';

import {EventCalendarContainerComponent} from './event-calendar-container.component';
import {CreateEventContextMenuComponent} from "./create-event-context-menu/create-event-context-menu.component";
import {EventContextMenuComponent} from "./event-context-menu/event-context-menu.component";
import {EventCalendarContainerComponentRoutingModule, routedComponents} from "./event-calendar-container.routing";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {MemoMaterialModule} from "../../../material.module";

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		MemoMaterialModule,
		EventCalendarContainerComponentRoutingModule
	],
	exports: [EventCalendarContainerComponent],
	declarations: [
		routedComponents,
		EventContextMenuComponent,
		CreateEventContextMenuComponent
	],

	entryComponents: [
		EventContextMenuComponent,
		CreateEventContextMenuComponent
	]
})
export class EventCalendarContainerModule {
}

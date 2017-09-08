import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {EventCalendarContainerComponent} from './event-calendar-container.component';

const routes: Routes = [
	{path: "calendar", component: EventCalendarContainerComponent},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class EventCalendarContainerComponentRoutingModule {
}

export const routedComponents = [EventCalendarContainerComponent];

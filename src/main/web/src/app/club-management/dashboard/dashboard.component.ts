import {Component, OnInit} from '@angular/core';
import {EventService} from "../../shared/services/api/event.service";
import {Observable} from "rxjs/Rx";
import {EventType} from "../../shop/shared/model/event-type";

@Component({
	selector: 'memo-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
	events$ = Observable.forkJoin(
		this.eventService.search("", EventType.tours).first(),
		this.eventService.search("", EventType.partys).first()
	)
		.map(([tours, partys]) => [...tours, ...partys]);


	constructor(private eventService: EventService) {
	}

	ngOnInit() {
	}

}

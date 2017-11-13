import {Component, OnInit} from '@angular/core';
import {EventService} from "../../shared/services/api/event.service";
import {EventType} from "../../shop/shared/model/event-type";
import {forkJoin} from "rxjs/observable/forkJoin";
import {first, map} from "rxjs/operators";

@Component({
	selector: 'memo-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
	events$ = forkJoin(
		this.eventService.search("", EventType.tours).pipe(first()),
		this.eventService.search("", EventType.partys).pipe(first())
	)
		.pipe(
			map(([tours, partys]) => [...tours, ...partys])
		);


	constructor(private eventService: EventService) {
	}

	ngOnInit() {
	}

}

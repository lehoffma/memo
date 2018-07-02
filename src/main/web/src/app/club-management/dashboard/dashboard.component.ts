import {Component, OnInit} from "@angular/core";
import {EventService} from "../../shared/services/api/event.service";
import {EventType} from "../../shop/shared/model/event-type";
import {forkJoin} from "rxjs";
import {first, map} from "rxjs/operators";
import {PageRequest} from "../../shared/model/api/page-request";
import {Sort} from "../../shared/model/api/sort";

@Component({
	selector: "memo-dashboard",
	templateUrl: "./dashboard.component.html",
	styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit {
	events$ = forkJoin(
		this.eventService.getByEventType(EventType.tours, PageRequest.first(), Sort.none())
			.pipe(first(), map(it => it.content)),
		this.eventService.getByEventType(EventType.partys, PageRequest.first(), Sort.none())
			.pipe(first(), map(it => it.content)),
	)
		.pipe(
			map(([tours, partys]) => [...tours, ...partys])
		);


	constructor(private eventService: EventService) {
	}

	ngOnInit() {
	}

}

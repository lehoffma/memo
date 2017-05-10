import {Component, OnInit} from "@angular/core";
import {Tour} from "../../shared/model/tour";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {Participant} from "../../shared/model/participant";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventService} from "../../../shared/services/event.service";
import {EventType} from "../../shared/model/event-type";


@Component({
	selector: "memo-tour-details",
	templateUrl: "./tour-detail.component.html",
	styleUrls: ["./tour-detail.component.scss"]
})
export class TourDetailComponent implements OnInit {
	tourObservable: Observable<Tour> = Observable.of(Tour.create());
	overViewKeys: Observable<EventOverviewKey[]> = this.tourObservable.map(tour => tour.overviewKeys);


	tourRoute = {
		from: {
			latitude: 52.422650,
			longitude: 10.786546
		},
		to: {
			latitude: 53.0664330,
			longitude: 8.837605
		},
		center: function () {
			return {
				latitude: (this.from.latitude + this.to.latitude) / 2,
				longitude: (this.from.longitude + this.to.longitude) / 2
			}
		}
	};

	constructor(private activatedRoute: ActivatedRoute,
				private eventService: EventService) {

	}

	ngOnInit() {
		this.tourObservable = this.activatedRoute.params
			.flatMap(params => this.eventService.getById(+params["id"], {eventType: EventType.tours}));
	}

	private getIds(participants: Participant[]) {
		if (participants) {
			return participants.map(participant => participant.id);
		}
		return [];

	}
}

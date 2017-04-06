import {Component, OnInit} from "@angular/core";
import {Tour} from "../../shared/model/tour";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {Participant} from "../../shared/model/participant";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {TourStore} from "../../../shared/stores/tour.store";
import {EventService} from "../../../shared/services/event.service";


@Component({
	selector: "memo-tour-details",
	templateUrl: "./tour-detail.component.html",
	styleUrls: ["./tour-detail.component.scss"]
})
export class TourDetailComponent implements OnInit {
	tourObservable: Observable<Tour> = Observable.of(new Tour());
	overViewKeys: Observable<EventOverviewKey[]> = this.tourObservable.map(merch => this.eventService.getOverviewKeys(merch));


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
				private tourStore: TourStore,
				private eventService: EventService) {

	}

	ngOnInit() {
		this.tourObservable = this.activatedRoute.params
			.flatMap(params => this.tourStore.getDataByID(+params["id"]));
	}

	private getIds(participants: Participant[]) {
		if (participants) {
			return participants.map(participant => participant.id);
		}
		return [];

	}
}

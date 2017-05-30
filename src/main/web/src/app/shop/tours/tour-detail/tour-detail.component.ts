import {Component, OnInit} from "@angular/core";
import {Tour} from "../../shared/model/tour";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {Participant} from "../../shared/model/participant";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventService} from "../../../shared/services/event.service";
import {EventType} from "../../shared/model/event-type";
import {ParticipantsService} from "../../../shared/services/participants.service";
import {AddressService} from "../../../shared/services/address.service";


@Component({
	selector: "memo-tour-details",
	templateUrl: "./tour-detail.component.html",
	styleUrls: ["./tour-detail.component.scss"]
})
export class TourDetailComponent implements OnInit {
	tourObservable: Observable<Tour> = this.activatedRoute.params
		.flatMap(params => this.eventService.getById(+params["id"], {eventType: EventType.tours}));

	overViewKeys: Observable<EventOverviewKey[]> = this.tourObservable.map(tour => tour.overviewKeys);

	tourRoute = this.tourObservable
		.flatMap(tour => Observable.combineLatest(tour.route.map(addressId => this.addressService.getById(addressId))));

	participants = this.tourObservable
		.flatMap((tour:Tour) => this.participantService.getParticipantUsersByEvent(tour.id, EventType.partys));

	constructor(private activatedRoute: ActivatedRoute,
				private participantService: ParticipantsService,
				private addressService: AddressService,
				private eventService: EventService) {

	}

	ngOnInit() {
	}
}

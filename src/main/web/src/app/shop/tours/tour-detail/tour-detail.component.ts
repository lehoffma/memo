import {Component, OnInit} from "@angular/core";
import {Tour} from "../../shared/model/tour";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventService} from "../../../shared/services/event.service";
import {EventType} from "../../shared/model/event-type";
import {ParticipantsService} from "../../../shared/services/participants.service";
import {AddressService} from "../../../shared/services/address.service";
import {LogInService} from "../../../shared/services/login.service";
import {Permission} from "../../../shared/model/permission";
import {rolePermissions} from "../../../shared/model/club-role";


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
		.flatMap((tour: Tour) => this.participantService.getParticipantUsersByEvent(tour.id, EventType.tours));

	participantsLink = Observable.combineLatest(this.tourObservable, this.loginService.currentUser())
		.map(([tour, user]) => {
			if (user !== null) {
				let permissions = user.permissions ? user.permissions : rolePermissions[user.clubRole];
				return permissions.tour >= Permission.write
					? "/tours/" + tour.id + "/participants"
					: null
			}
			return null;
		});

	constructor(private activatedRoute: ActivatedRoute,
				private participantService: ParticipantsService,
				private loginService: LogInService,
				private addressService: AddressService,
				private eventService: EventService) {

	}

	ngOnInit() {
	}
}

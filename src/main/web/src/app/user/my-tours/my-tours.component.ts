import {Component, OnInit} from "@angular/core";
import {LogInService} from "../../shared/services/api/login.service";
import {Tour} from "../../shop/shared/model/tour";
import {Observable} from "rxjs/Observable";
import {EventService} from "../../shared/services/api/event.service";
import {Party} from "../../shop/shared/model/party";
import {dateSortingFunction} from "../../util/util";
import {ParticipantsService} from "../../shared/services/api/participants.service";

@Component({
	selector: "memo-my-tours",
	templateUrl: "./my-tours.component.html",
	styleUrls: ["./my-tours.component.scss"]
})
export class MyToursComponent implements OnInit {
	public createdTours$: Observable<(Tour | Party)[]> = this.loginService.accountObservable
		.flatMap(accountId => accountId === null
			? Observable.empty()
			: this.eventService.getHostedEventsOfUser(accountId))
		.map((events: (Tour | Party)[]) => {
			events.sort(dateSortingFunction<(Tour | Party)>(obj => obj.date, false));
			return events;
		})
		.share();

	public participatedTours$ = this.loginService.accountObservable
		.flatMap(accountId => accountId === null
			? Observable.empty()
			: this.participantService.getParticipatedEventsOfUser(accountId))
		.map((events: (Tour | Party)[]) => {
			events.sort(dateSortingFunction<(Tour | Party)>(obj => obj.date, false));
			return events;
		})
		.share();

	//todo: past/future/all events filter dropdown
	//todo: search bar?

	constructor(private loginService: LogInService,
				private participantService: ParticipantsService,
				private eventService: EventService) {
	}

	ngOnInit() {
	}

}

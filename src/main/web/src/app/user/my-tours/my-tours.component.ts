import {Component, OnInit} from "@angular/core";
import {LogInService} from "../../shared/services/login.service";
import {Tour} from "../../shop/shared/model/tour";
import {Observable} from "rxjs/Observable";
import {EventService} from "../../shared/services/event.service";
import {Party} from "../../shop/shared/model/party";

@Component({
	selector: "memo-my-tours",
	templateUrl: "./my-tours.component.html",
	styleUrls: ["./my-tours.component.scss"]
})
export class MyToursComponent implements OnInit {
	private tours: Observable<(Tour | Party)[]> = this.loginService.accountObservable
		.flatMap(accountId => accountId === null
			? Observable.empty()
			: this.eventService.getEventsOfUser(accountId, {tours: true, partys: true}));

	constructor(private loginService: LogInService,
				private eventService: EventService) {
	}

	ngOnInit() {
	}

}

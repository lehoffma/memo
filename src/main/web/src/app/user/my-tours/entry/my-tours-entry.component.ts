import {Component, Input, OnInit} from "@angular/core";
import {Event} from "../../../shop/shared/model/event";
import {Address} from "../../../shared/model/address";
import {EventType} from "../../../shop/shared/model/event-type";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {BehaviorSubject, EMPTY, Observable, Subject} from "rxjs";
import {isBefore} from "date-fns";
import {AddressService} from "../../../shared/services/api/address.service";
import {filter, map, switchMap} from "rxjs/operators";


@Component({
	selector: "memo-my-tours-entry",
	templateUrl: "./my-tours-entry.component.html",
	styleUrls: ["./my-tours-entry.component.scss"]
})
export class MyToursEntryComponent implements OnInit {
	event$: BehaviorSubject<Event> = new BehaviorSubject(null);

	@Input() set event(event: Event) {
		if (event) {
			this.event$.next(event);
		}
	}

	from$: Observable<Address> = this.event$.pipe(
		filter(it => it !== null),
		switchMap(event => event.route.length > 0
			? this.addressService.getById(event.route[0])
			: EMPTY
		)
	);
	to$: Observable<Address> = this.event$.pipe(
		filter(it => it !== null),
		switchMap(event => event.route.length > 1
			? this.addressService.getById(event.route[event.route.length - 1])
			: EMPTY
		)
	);
	eventType$: Observable<EventType> = this.event$.pipe(
		filter(it => it !== null),
		map(event => EventUtilityService.getEventType(event))
	);
	isTour$: Observable<boolean> = this.eventType$.pipe(
		map(type => type === EventType.tours)
	);
	eventIsInThePast$: Observable<boolean> = this.event$.pipe(
		filter(it => it !== null),
		map(event => isBefore(event.date, new Date()))
	);

	constructor(private addressService: AddressService) {
	}

	ngOnInit() {
	}

}

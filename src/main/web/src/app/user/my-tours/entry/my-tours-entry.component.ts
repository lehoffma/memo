import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {Event} from "../../../shop/shared/model/event";
import {AddressService} from "../../../shared/services/api/address.service";
import {Address} from "../../../shared/model/address";
import {Observable} from "rxjs/Rx";
import {EventType} from "../../../shop/shared/model/event-type";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import * as moment from "moment";


@Component({
	selector: "memo-my-tours-entry",
	templateUrl: "./my-tours-entry.component.html",
	styleUrls: ["./my-tours-entry.component.scss"]
})
export class MyToursEntryComponent implements OnInit, OnChanges {
	@Input() event: Event;

	isTour: boolean = true;
	from$: Observable<Address>;
	to$: Observable<Address>;
	eventType: EventType;
	eventIsInThePast: boolean = false;

	constructor(private addressService: AddressService) {
	}

	ngOnInit() {
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["event"]) {
			this.isTour = this.event.route.length > 1;
			this.eventIsInThePast = moment(this.event.date).isBefore(moment());
			this.eventType = EventUtilityService.getEventType(this.event);
			this.from$ = this.addressService.getById(this.event.route[0]);
			if(this.event.route.length > 1){
				this.to$ = this.addressService.getById(this.event.route[this.event.route.length - 1]);
			}
		}
	}
}

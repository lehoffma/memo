import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Party} from "../../shop/shared/model/party";
import {Tour} from "../../shop/shared/model/tour";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {WindowService} from "../services/window.service";

@Component({
	selector: "memo-event-calendar",
	templateUrl: "./event-calendar.component.html",
	styleUrls: ["./event-calendar.component.scss"]
})
export class EventCalendarComponent implements OnInit {
	events$: BehaviorSubject<(Tour | Party)[]> = new BehaviorSubject<(Tour | Party)[]>([]);
	@Input() editable: boolean; //todo mit options verknüpfen
	calendarEvents$ = this.events$
		.filter(events => events !== null)
		.map(events => {
			return events.map(event => ({
				id: event.id,
				title: event.title,
				start: event.date,
				//todo combineLatest
				editable: this.editable
			}))
		})
		.defaultIfEmpty([]);
	@Output() onDayClick: EventEmitter<Date> = new EventEmitter();
	@Output() onEventClick: EventEmitter<number> = new EventEmitter();

	height$ = this.windowService.dimension$
		.map(dimensions => dimensions.height);

	constructor(private windowService: WindowService) {
	}

	@Input()
	set events(events: (Tour | Party)[]) {
		this.events$.next(events);
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param event
	 */
	dayClickHandler(event) {
		if (event.date) {
			let clickEventDate: any = event.date;
			let date: Date = clickEventDate.toDate();
			this.onDayClick.emit(date);
		}
	}

	/**
	 *
	 * @param event
	 */
	eventClickHandler(event) {
		if (event.calEvent) {
			let calendarEvent: any = event.calEvent;
			let id = calendarEvent.id;
			this.onEventClick.emit(id);
		}
	}
}

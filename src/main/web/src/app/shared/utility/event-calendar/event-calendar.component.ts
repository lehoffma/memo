import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Party} from "../../../shop/shared/model/party";
import {Tour} from "../../../shop/shared/model/tour";
import {WindowService} from "../../services/window.service";
import {BehaviorSubject, Observable} from "rxjs";
import {defaultIfEmpty, filter, map} from "rxjs/operators";
import {CalendarEvent} from "angular-calendar";
import {MonthViewDay} from "calendar-utils";
import {EventUtilityService} from "../../services/event-utility.service";

@Component({
	selector: "memo-event-calendar",
	templateUrl: "./event-calendar.component.html",
	styleUrls: ["./event-calendar.component.scss"]
})
export class EventCalendarComponent implements OnInit {
	events$: BehaviorSubject<(Tour | Party)[]> = new BehaviorSubject<(Tour | Party)[]>([]);
	@Output() onDayClick: EventEmitter<Date> = new EventEmitter();
	@Output() onEventClick: EventEmitter<(Tour | Party)> = new EventEmitter();
	@Output() onMonthChange: EventEmitter<Date> = new EventEmitter<Date>();
	calendarEvents$: Observable<CalendarEvent[]> = this.events$
		.pipe(
			filter(events => events !== null),
			map(events => events.map(event => ({
				start: event.date,
				title: event.title,
				color: {
					primary: "green",
					secondary: "white"
				},
				meta: event
			}))),
			defaultIfEmpty([])
		);
	eventTypeMap$: Observable<{ [id: number]: string }> = this.events$
		.pipe(
			filter(events => events !== null),
			map(events => events.reduce((typeMap, event) => {
				typeMap[event.id] = EventUtilityService.getEventTypeAsString(event);
				return typeMap;
			}, {})),
			defaultIfEmpty({})
		);

	constructor(private windowService: WindowService) {
	}

	_date = new Date();

	get date() {
		return this._date;
	}

	set date(date: Date) {
		this._date = date;
		this.onMonthChange.emit(date);
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
	dayClickHandler(event: { day: MonthViewDay<any> }) {
		this.onDayClick.emit(event.day.date);
	}

	/**
	 *
	 * @param event
	 */
	eventClickHandler(event: CalendarEvent) {
		this.onEventClick.emit(event.meta);
	}
}

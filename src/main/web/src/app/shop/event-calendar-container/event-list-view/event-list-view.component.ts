import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Party} from "../../shared/model/party";
import {Tour} from "../../shared/model/tour";
import {GroupedEventList} from "./grouped-event-list";
import {
	addDays,
	endOfMonth,
	endOfWeek,
	format,
	getDayOfYear,
	isAfter,
	isBefore,
	isEqual,
	setMonth,
	setYear,
	startOfDay,
	startOfMonth,
	startOfWeek
} from "date-fns";

@Component({
	selector: "memo-event-list-view",
	templateUrl: "./event-list-view.component.html",
	styleUrls: ["./event-list-view.component.scss"]
})
export class EventListViewComponent implements OnInit {
	groupedEventList: GroupedEventList = {
		"Heute": [],
		"Morgen": [],
		"Diese Woche": [],
		"Dieser Monat": [],
	};

	groupedListKeys = Object.keys(this.groupedEventList);
	@Output() onAddEvent = new EventEmitter<Date>();

	constructor() {
	}

	@Input()
	set events(events: (Party | Tour)[]) {
		if (events !== null) {
			this.groupedEventList = this.groupEvents(events);
			this.groupedListKeys = Object.keys(this.groupedEventList);
		}
	}

	ngOnInit() {
	}

	/**
	 * Checks whether the given event is part of any of the given arrays
	 * @param {Party | Tour} event
	 * @param {(Party | Tour)[]} events
	 * @returns {boolean} true if the given event is NOT part of any given array, false otherwise
	 */
	eventIsNotPartOf(event: Party | Tour, ...events: (Party | Tour)[][]) {
		return events
			.every(eventList => eventList.findIndex(it => it.id === event.id) === -1);
	}

	/**
	 *
	 * @param {(Party | Tour)[]} events
	 * @returns {GroupedEventList}
	 */
	groupEvents(events: (Party | Tour)[]): GroupedEventList {
		const upcomingEvents = events
			.filter(event => {
				const start = startOfDay(new Date());
				return isAfter(event.date, start) || isEqual(event.date, start);
			});

		const today = upcomingEvents
			.filter(event => getDayOfYear(event.date) === getDayOfYear(new Date()));

		const tomorrow = upcomingEvents
			.filter(event => getDayOfYear(event.date) === getDayOfYear(addDays(new Date(), 1)));

		const thisWeek = upcomingEvents
		//remove events that are already part of "today" and "tomorrow"
			.filter(event => this.eventIsNotPartOf(event, today, tomorrow))
			.filter(event => {
				const _tomorrow = addDays(new Date(), 1);
				const startOfTomorrow = startOfDay(_tomorrow);
				const endOfTheWeek = endOfWeek(new Date());
				return isAfter(event.date, startOfTomorrow) && (isBefore(event.date, endOfTheWeek) || isEqual(event.date, endOfTheWeek))
			});

		const thisMonth = upcomingEvents
			.filter(event => this.eventIsNotPartOf(event, today, tomorrow, thisWeek))
			.filter(event => isAfter(event.date, startOfMonth(new Date())) && isBefore(event.date, endOfMonth(new Date())));

		const remainingEvents = upcomingEvents
			.filter(event => this.eventIsNotPartOf(event, today, tomorrow, thisWeek, thisMonth));

		const remainingGroups: {
			[month: string]: (Party | Tour)[];
		} = remainingEvents
			.reduce((groups, event) => {
				const monthName = format(event.date, "MMMM YYYY");
				if (groups[monthName]) {
					groups[monthName].push(event);
				}
				else {
					groups[monthName] = [event];
				}

				return groups;
			}, {});

		return {
			"Heute": today,
			"Morgen": tomorrow,
			"Diese Woche": thisWeek,
			"Dieser Monat": thisMonth,
			...remainingGroups
		};
	}


	onAddCallback(key: keyof GroupedEventList, groupedEventList: (Party | Tour)[]) {
		let date = new Date();

		switch (key) {
			case "Heute":
				date = startOfDay(date);
				break;
			case "Morgen":
				date = startOfDay(addDays(date, 1));
				break;
			case "Diese Woche":
				date = startOfWeek(date);
				break;
			case "Dieser Monat":
				date = startOfMonth(date);
				break;
			//example: "Juni 2017", "Juli 2017", "August 2018" etc.
			default:
				const pattern = /(\w+) (\d+)/;
				const patternResults = pattern.exec(key);
				const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober",
					"November", "Dezember"];
				const month = months.indexOf(patternResults[1]);
				const year = +patternResults[2];
				date = setMonth(setYear(date, year), month);
				break;
		}

		this.onAddEvent.emit(date);
	}
}

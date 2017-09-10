import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Party} from "../../shared/model/party";
import {Tour} from "../../shared/model/tour";
import {GroupedEventList} from "./grouped-event-list";
import * as moment from "moment";
import {Moment} from "moment";

@Component({
	selector: 'memo-event-list-view',
	templateUrl: './event-list-view.component.html',
	styleUrls: ['./event-list-view.component.scss']
})
export class EventListViewComponent implements OnInit {
	groupedEventList: GroupedEventList = {
		"Heute": [],
		"Morgen": [],
		"Diese Woche": [],
		"Dieser Monat": [],
	};

	groupedListKeys = Object.keys(this.groupedEventList);

	@Input()
	set events(events: (Party | Tour)[]) {
		if (events !== null) {
			this.groupedEventList = this.groupEvents(events);
			this.groupedListKeys = Object.keys(this.groupedEventList);
		}
	}


	@Output() onAddEvent = new EventEmitter<Moment>();

	constructor() {
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
			.filter(event => event.date.isSameOrAfter(moment().startOf("day")));

		console.log(upcomingEvents);

		const today = upcomingEvents
			.filter(event => event.date.dayOfYear() === moment().dayOfYear());

		const tomorrow = upcomingEvents
			.filter(event => event.date.dayOfYear() === moment().add(1, "day" ).dayOfYear());

		const thisWeek = upcomingEvents
		//remove events that are already part of "today" and "tomorrow"
			.filter(event => this.eventIsNotPartOf(event, today, tomorrow))
			.filter(event => event.date.isAfter(moment().add(1, "day" ).startOf("day"))
				&& event.date.isSameOrBefore(moment().endOf("week")));

		const thisMonth = upcomingEvents
			.filter(event => this.eventIsNotPartOf(event, today, tomorrow, thisWeek))
			.filter(event => event.date.isBetween(moment().startOf("month"), moment().endOf("month")));

		const remainingEvents = upcomingEvents
			.filter(event => this.eventIsNotPartOf(event, today, tomorrow, thisWeek, thisMonth));

		const remainingGroups: {
			[month: string]: (Party | Tour)[];
		} = remainingEvents
			.reduce((groups, event) => {
				const monthName = event.date.format('MMMM YYYY');
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
		let date = moment();

		switch (key) {
			case "Heute":
				date = moment().startOf("day");
				break;
			case "Morgen":
				date = moment().add(1, "day" );
				break;
			case "Diese Woche":
				date = moment().startOf("week");
				break;
			case "Dieser Monat":
				date = moment().startOf("month");
				break;
				//example: "Juni 2017", "Juli 2017", "August 2018" etc.
			default:
				const pattern = /(\w+) (\d+)/;
				const patternResults = pattern.exec(key);
				const month = patternResults[1];
				const year = +patternResults[2];
				date = moment().locale("de").month(month).year(year).startOf("month");
				break;
		}

		this.onAddEvent.emit(date);
	}
}

import {Component, Input, OnInit} from "@angular/core";
import {Event} from "../../../shop/shared/model/event";
import {NavigationService} from "../../../shared/services/navigation.service";
import {EventType} from "../../../shop/shared/model/event-type";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {distanceInWordsStrict} from "date-fns";
import * as deLocale from "date-fns/locale/de";

const DEFAULT_AMOUNT_SHOWN = 3;

@Component({
	selector: "memo-participated-tours-preview",
	templateUrl: "./participated-tours-preview.component.html",
	styleUrls: ["./participated-tours-preview.component.scss"],

	animations: [
		trigger("expandedState", [
			state("1", style({transform: "rotate(180deg)"})),
			state("0", style({transform: "rotate(360deg)"})),
			transition("0 => 1", animate("200ms ease-in")),
			transition("1 => 0", animate("200ms ease-out")),
		]),
		//todo wäre voll cool :/
		trigger("slideInAndOut", [
			state("in", style({height: "*"})),
			transition("* => void", [
				style({height: "*"}),
				animate(250, style({height: 0}))
			])
		])
	]
})
export class ParticipatedToursPreviewComponent implements OnInit {
	@Input() userEvents: Event[] = [];
	expandedStatus = false;
	_links: { [id: number]: string } = {};

	constructor(private navigationService: NavigationService) {
	}

	get amountOfEventsShown() {
		if (this.expandedStatus) {
			return this.userEvents.length;
		}
		return DEFAULT_AMOUNT_SHOWN;
	}

	ngOnInit() {
	}

	distanceInWords(date: Date) {
		return distanceInWordsStrict(new Date(), date, {addSuffix: true, locale: deLocale});
	}

	getLink(event: Event): string {
		if (!event) {
			return "";
		}

		if (!this._links[event.id]) {
			const eventType: EventType = EventUtilityService.getEventType(event);
			this._links[event.id] = `/${eventType}/${event.id}`;
		}

		return this._links[event.id];
	}

	showEvent(recentEvent: Event) {
		const eventType: EventType = EventUtilityService.getEventType(recentEvent);
		this.navigationService.navigateByUrl(`${eventType}/${recentEvent.id}`);
	}

}

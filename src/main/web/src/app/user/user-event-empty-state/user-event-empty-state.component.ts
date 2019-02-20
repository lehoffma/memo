import {Component, Input, OnInit} from "@angular/core";

export type UserEventEmptyStateType = "participated" | "responsible";
export type UserEventEmptyStateTime = "past" | "future";

@Component({
	selector: "memo-user-event-empty-state",
	templateUrl: "./user-event-empty-state.component.html",
	styleUrls: ["./user-event-empty-state.component.scss"]
})
export class UserEventEmptyStateComponent implements OnInit {
	@Input() view: UserEventEmptyStateType = "participated";
	@Input() time: UserEventEmptyStateTime = "past";

	titles: { [key in UserEventEmptyStateType]: { [key in UserEventEmptyStateTime]: string } } = {
		"participated": {
			"past": "Du hast noch an keinem Event teilgenommen.",
			"future": "Du bist für kein Event angemeldet.",
		},
		"responsible": {
			"past": "Du warst noch nie für ein Event verantwortlich",
			"future": "Du bist bisher für kein Event verantwortlich",
		}
	};
	body = "Das solltest du schleunigst ändern! Hier ein paar Links, die dir dabei helfen können:";

	icons: { [key in UserEventEmptyStateType]: string } = {
		"participated": "event_busy",
		"responsible": "person"
	};

	links: {
		[key in UserEventEmptyStateType]: {
			link: string;
			image: string;
			label: string;
		}[]
	} = {
		"participated": [
			{
				link: "/tours",
				image: "../resources/images/tour_image.jpg",
				label: "Touren"
			},

			{
				link: "/partys",
				image: "../resources/images/event_image.jpg",
				label: "Veranstaltungen"
			}
		],
		"responsible": [
			{
				link: "/create/tours",
				image: "../resources/images/tour_image.jpg",
				label: "Tour erstellen"
			},

			{
				link: "/create/partys",
				image: "../resources/images/event_image.jpg",
				label: "Veranstaltung erstellen"
			}
		]
	};

	constructor() {
	}

	ngOnInit() {
	}

}

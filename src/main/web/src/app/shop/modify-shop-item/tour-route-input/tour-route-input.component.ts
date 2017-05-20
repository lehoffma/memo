import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "memo-tour-route-input",
	templateUrl: "./tour-route-input.component.html",
	styleUrls: ["./tour-route-input.component.scss"]
})
export class TourRouteInputComponent implements OnInit {
	@Input() isRoute: boolean = false;
	//todo: interface für EventRoute {meetingPoint: {latitude: number, longitude: number}, destination: {latitude: number, longitude: number}}
	@Input() route: any;

	constructor() {
	}

	ngOnInit() {
	}

}

import {Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild} from "@angular/core";
import {EventRoute} from "../../shared/model/route";
import {MapsAPILoader} from "@agm/core";

declare var google;

@Component({
	selector: "memo-tour-route-input",
	templateUrl: "./tour-route-input.component.html",
	styleUrls: ["./tour-route-input.component.scss"]
})
export class TourRouteInputComponent implements OnInit {
	@Input() isRoute: boolean = false;
	@Input() route: EventRoute;

	@Output() routeChange = new EventEmitter<EventRoute>();


	positionValidity = {
		meetingPoint: false,
		destination: false
	};


	@ViewChild("meetingPointInput")
	public meetingPointInput: ElementRef;
	@ViewChild("destinationInput")
	public destinationInput: ElementRef;

	constructor(private mapsAPILoader: MapsAPILoader,
				private ngZone: NgZone) {
	}

	ngOnInit() {
		this.mapsAPILoader.load().then(() => {
			this.initAutoComplete(this.meetingPointInput.nativeElement, "meetingPoint");
			if (this.isRoute) {
				this.initAutoComplete(this.destinationInput.nativeElement, "destination");
			}
		})
	}

	initAutoComplete(inputElement: any, validityKey: string) {
		let autocomplete = new google.maps.places.Autocomplete(inputElement, {
			types: ["address"]
		});

		autocomplete.addListener("place_changed", () => {
			this.ngZone.run(() => {
				//get the place result
				let place = autocomplete.getPlace();

				//verify result
				if (place.geometry === undefined || place.geometry === null) {
					this.positionValidity[validityKey] = false;
					return;
				}

				this.positionValidity[validityKey] = true;
			});
		});
	}
}

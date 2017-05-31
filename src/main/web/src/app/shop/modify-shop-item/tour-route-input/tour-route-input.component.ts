import {Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild} from "@angular/core";
import {EventRoute} from "../../shared/model/route";
import {MapsAPILoader} from "@agm/core";
import {Address} from "../../../shared/model/address";

declare var google;

@Component({
	selector: "memo-tour-route-input",
	templateUrl: "./tour-route-input.component.html",
	styleUrls: ["./tour-route-input.component.scss"]
})
export class TourRouteInputComponent implements OnInit {

	//TODO an neues routen modell anpassen....
	@Input() isRoute: boolean = false;
	@Input() route: {
		meetingPoint: Address,
		destination: Address
	} = {
		meetingPoint: Address.create(),
		destination: Address.create()
	};

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
		if(!this.route){
			this.route = {
				meetingPoint: Address.create(),
				destination: Address.create()
			};
		}
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
				this.route[validityKey].latitude = place.geometry.location.lat();
				this.route[validityKey].longitude = place.geometry.location.lng();

				//verify result
				if (place.geometry === undefined || place.geometry === null) {
					this.positionValidity[validityKey] = false;
					return;
				}

				this.positionValidity[validityKey] = true;
			});
		});
	}

	getCenterOfTour() {
		if(this.isRoute){
			return {
				latitude: ((this.route.meetingPoint.latitude + this.route.destination.latitude) / 2),
				longitude: ((this.route.meetingPoint.longitude + this.route.destination.longitude) / 2)
			}
		}
		return {
			latitude: this.route.meetingPoint.latitude,
			longitude: this.route.meetingPoint.longitude
		}
	}
}

import {GoogleMapsAPIWrapper} from "@agm/core";
import {Directive, EventEmitter, Input, Output} from "@angular/core";
import {Address} from "../../../../../shared/model/address";
import {BehaviorSubject} from "rxjs";
import {filter} from "rxjs/operators";

declare var google;

@Directive({
	selector: "sebm-google-map-directions"
})
export class DirectionsMapDirective {
	_route$: BehaviorSubject<Address[]> = new BehaviorSubject([]);
	totalDistance: BehaviorSubject<number> = new BehaviorSubject(0);
	@Input() directionsDisplay;
	@Output() totalDistanceChange: EventEmitter<number> = new EventEmitter();

	constructor(private googleMapsApi: GoogleMapsAPIWrapper) {
	}

	@Input()
	set route(route: Address[]) {
		this._route$.next(route);
	}

	getTotalDistance(response: any): number {
		return response.routes.reduce((totalDistance, route) => {
			return totalDistance + route.legs.reduce((total, leg) => {
				return total + leg.distance.value;
			}, 0)
		}, 0);
	}

	//todo display miles

	ngOnInit() {
		this.totalDistance
			.pipe(
				filter(value => value > 0)
			)
			.subscribe(value => this.totalDistanceChange.emit(value));

		this._route$
			.pipe(
				filter(route => route && route.length > 1)
			)
			.subscribe(route => {
				this.googleMapsApi.getNativeMap().then(map => {
					const directionsService = new google.maps.DirectionsService;

					let origin = {lat: 0, lng: 0};
					let destination = {lat: 0, lng: 0};
					let waypoints = [];

					if (route) {
						if (route.length > 0) {
							origin = {lat: route[0].latitude, lng: route[0].longitude};
						}
						if (route.length > 1) {
							destination = {
								lat: route[route.length - 1].latitude,
								lng: route[route.length - 1].longitude
							};
						}
						if (route.length > 2) {
							waypoints = route.slice(1, route.length - 1)
								.map(stop => ({
									location: {
										lat: stop.latitude,
										lng: stop.longitude
									},
									stopover: false
								}));
						}
					}

					this.directionsDisplay.setMap(map);
					directionsService.route(
						{
							origin,
							destination,
							waypoints,
							optimizeWaypoints: true,
							travelMode: "DRIVING"
						}, (response, status) => {
							if (status === "OK") {
								this.totalDistance.next(this.getTotalDistance(response));
								this.directionsDisplay.setDirections(response);
							} else {
								window.alert("Directions request failed due to " + status);
							}
						});

				});
			})
	}
}

import {GoogleMapsAPIWrapper} from "@agm/core";
import {Directive, EventEmitter, Input, OnDestroy, Output} from "@angular/core";
import {Address} from "../../../../../shared/model/address";
import {BehaviorSubject, Subject} from "rxjs";
import {filter, takeUntil} from "rxjs/operators";

declare var google;

@Directive({
	selector: "sebm-google-map-directions"
})
export class DirectionsMapDirective implements OnDestroy {
	_route$: BehaviorSubject<Address[]> = new BehaviorSubject([]);
	totalDistance: BehaviorSubject<number> = new BehaviorSubject(0);
	@Input() directionsDisplay;
	@Output() totalDistanceChange: EventEmitter<number> = new EventEmitter();
	@Output() durationChange = new EventEmitter();

	onDestroy$ = new Subject();

	constructor(private googleMapsApi: GoogleMapsAPIWrapper) {
	}

	@Input()
	set route(route: Address[]) {
		this._route$.next(route);
	}

	getTotalDistance(response: any): number {
		return response.routes[0].legs.reduce((total, leg) => {
			return total + leg.distance.value;
		}, 0);
	}

	getTotalDuration(response: any): number {
		return response.routes[0].legs.reduce((total, leg) => {
			return total + leg.duration.value
		}, 0);
	}

	//todo display miles

	ngOnInit() {
		this.totalDistance
			.pipe(
				filter(value => value > 0),
				takeUntil(this.onDestroy$)
			)
			.subscribe(value => this.totalDistanceChange.emit(value));

		this._route$
			.pipe(
				filter(route => route && route.length > 1),
				takeUntil(this.onDestroy$)
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
									stopover: true
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
								this.durationChange.next(this.getTotalDuration(response));
								this.directionsDisplay.setDirections(response);
							} else {
								window.alert("Directions request failed due to " + status);
							}
						});

				});
			})
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}
}

import {GoogleMapsAPIWrapper} from "@agm/core";
import {Directive, Input} from "@angular/core";
import {Address} from "../../../../shared/model/address";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

declare var google;

@Directive({
	selector: 'sebm-google-map-directions'
})
export class DirectionsMapDirective {
	_route$: BehaviorSubject<Address[]> = new BehaviorSubject([]);

	@Input()
	set route(route: Address[]) {
		this._route$.next(route);
	}

	@Input() directionsDisplay;

	constructor(private googleMapsApi: GoogleMapsAPIWrapper) {
	}

	ngOnInit() {
		this._route$
			.filter(route => route && route.length > 1)
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
									lat: stop.latitude,
									lng: stop.longitude
								}));
						}
					}

					this.directionsDisplay.setMap(map);
					directionsService.route({
						origin,
						destination,
						waypoints,
						optimizeWaypoints: true,
						travelMode: 'DRIVING'
					}, (response, status) => {
						if (status === 'OK') {
							this.directionsDisplay.setDirections(response);
						} else {
							window.alert('Directions request failed due to ' + status);
						}
					});

				});
			})
	}
}

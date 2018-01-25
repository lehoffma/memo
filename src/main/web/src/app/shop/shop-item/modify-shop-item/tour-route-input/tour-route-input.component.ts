import {
	AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output,
	QueryList, SimpleChanges, ViewChildren
} from "@angular/core";
import {MapsAPILoader} from "@agm/core";
import {Address} from "../../../../shared/model/address";
import {defaultIfEmpty, map} from "rxjs/operators";
import {RoutingService} from "../../../shared/services/routing.service";


declare var google;

@Component({
	selector: "memo-tour-route-input",
	templateUrl: "./tour-route-input.component.html",
	styleUrls: ["./tour-route-input.component.scss"]
})
export class TourRouteInputComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
	@Input() isTour: boolean = false;
	@Input() route: Address[] = [];

	@Output() routeChange = new EventEmitter<Address[]>();
	@Output() distanceChange = new EventEmitter<number>();
	@ViewChildren("routeInput") inputs: QueryList<ElementRef>;


	centerOfTour$ = this.routeChange
		.pipe(
			map(this.routingService.centerOfRoute),
			defaultIfEmpty({
				longitude: 0,
				latitude: 0
			})
		);

	initializedRoute$ = this.routeChange
		.pipe(
			map(route => route.filter(it => it.longitude !== 0 && it.latitude !== 0)),
			defaultIfEmpty([])
		);

	directionsDisplay;
	showDirective = false;
	private _totalDistance = 0;

	get totalDistance() {
		return this._totalDistance
	}

	set totalDistance(distance: number) {
		this._totalDistance = distance;
		this.distanceChange.emit(distance);
	}


	subscriptions = [];

	constructor(private mapsAPILoader: MapsAPILoader,
				private routingService: RoutingService,
				private ngZone: NgZone) {
	}


	get modelRoute() {
		return this.route;
	}

	set modelRoute(newRoute: Address[]) {
		this.route = newRoute;
		this.routeChange.emit(this.route);
	}


	ngOnInit() {
		if (this.directionsDisplay === undefined) {
			this.mapsAPILoader.load().then(() => {
				this.directionsDisplay = new google.maps.DirectionsRenderer;
				this.showDirective = true;
			});
		}
	}


	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["route"] && !this.modelRoute) {
			if (this.isTour) {
				this.modelRoute = [Address.create(), Address.create()];
			}
			else {
				this.modelRoute = [Address.create()];
			}
		}
	}

	ngAfterViewInit() {
		//if the route is pre-configured (i.e. we're editing something), the transformedRoute will be initialized.
		//otherwise, nothing happens
		this.modelRoute = this.modelRoute;

		if (this.inputs.length > 0) {
			this.mapsAPILoader.load().then(() => {
				this.inputs.forEach((input, index) => {
					this.initAutoComplete(input.nativeElement, index);
				})
			})
		}
		this.subscriptions.push(this.inputs.changes.subscribe(queryList => {
			if (queryList) {
				this.mapsAPILoader.load().then(() => {
					queryList.forEach((input, index) => {
						this.initAutoComplete(input.nativeElement, index);
					})
				})
			}
		}));
	}

	addNewStop() {
		this.modelRoute.splice(this.modelRoute.length - 1, 0, Address.create());
		this.modelRoute = this.modelRoute;
	}

	removeStop(index) {
		this.modelRoute.splice(index, 1);
		this.modelRoute = this.modelRoute;
	}

	swapRoutes(first, second) {
		this.modelRoute = [
			...this.modelRoute.filter((it, i) => i < first),
			this.modelRoute[second],
			this.modelRoute[first],
			...this.modelRoute.filter((it, i) => i > second)
		]
	}


	/**
	 *
	 * @param inputElement
	 * @param {number} index
	 */
	initAutoComplete(inputElement: any, index: number) {
		let autocomplete = new google.maps.places.Autocomplete(inputElement, {
			types: ["address"]
		});


		autocomplete.addListener("place_changed", () => {
			this.ngZone.run(() => {
				//get the place result
				let place = autocomplete.getPlace();

				this.modelRoute = [
					...this.modelRoute.slice(0, index),
					this.routingService.transformToMemoFormat(place, this.modelRoute[index]),
					...this.modelRoute.slice(index + 1)
				];

				//verify result
				if (place.geometry === undefined || place.geometry === null) {
					return;
				}
			});
		});
	}
}

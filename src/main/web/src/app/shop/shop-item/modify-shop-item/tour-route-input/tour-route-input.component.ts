import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	NgZone,
	OnChanges,
	OnInit,
	Output,
	QueryList,
	SimpleChanges,
	ViewChildren
} from "@angular/core";
import {MapsAPILoader} from "@agm/core";
import {Address} from "../../../../shared/model/address";

declare var google;

@Component({
	selector: "memo-tour-route-input",
	templateUrl: "./tour-route-input.component.html",
	styleUrls: ["./tour-route-input.component.scss"]
})
export class TourRouteInputComponent implements OnInit, OnChanges, AfterViewInit {
	@Input() isTour: boolean = false;
	@Input() route: Address[] = [];

	@Output() routeChange = new EventEmitter<Address[]>();
	transformedRoutes: string[] = [];
	@ViewChildren("routeInput") inputs: QueryList<ElementRef>;

	constructor(private mapsAPILoader: MapsAPILoader,
				private ngZone: NgZone) {
	}

	get modelRoute() {
		return this.route;
	}

	set modelRoute(newRoute: Address[]) {
		this.route = newRoute;
		this.updateTransformedRoute(newRoute);
		this.routeChange.emit(this.route);
	}

	ngOnInit() {
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
		this.inputs.changes.subscribe(queryList => {
			if (queryList) {
				this.mapsAPILoader.load().then(() => {
					queryList.forEach((input, index) => {
						this.initAutoComplete(input.nativeElement, index);
					})
				})
			}
		});
	}

	updateTransformedRoute(newRoute: Address[]) {
		this.transformedRoutes = newRoute
			.map(tourStop =>
				tourStop.street
					//Format: "Alexanderpl. 2, 10178 Berlin, Deutschland"
					? `${tourStop.street}${tourStop.streetNr ? " " + tourStop.streetNr : ""}, ${tourStop.zip} ${tourStop.city}, ${tourStop.country}`
					: ""
			);
	}

	addNewStop() {
		this.modelRoute.splice(this.modelRoute.length - 1, 0, Address.create());
		this.updateTransformedRoute(this.modelRoute);
	}

	removeStop(index) {
		this.modelRoute.splice(index, 1);
		this.updateTransformedRoute(this.modelRoute);
	}

	initAutoComplete(inputElement: any, index: number) {
		let autocomplete = new google.maps.places.Autocomplete(inputElement, {
			types: ["address"]
		});

		autocomplete.addListener("place_changed", () => {
			this.ngZone.run(() => {
				//get the place result
				let place = autocomplete.getPlace();

				this.modelRoute = [...this.modelRoute.map((route, i) => {
					if (i === index) {
						//"Alexanderpl. 2, 10178 Berlin, Deutschland"
						let address = place.formatted_address;
						//lets hope that the format stays the same.. (todo test)
						let regexMatches = address.match(/([^\s]+)(?:\s([\d\w]+))?,\s(\d+)\s([^\s]+),\s([^\s]+)/);
						if (regexMatches !== null) {
							/*
							 0:"Alexanderpl. 2, 10178 Berlin, Deutschland"
							 1:"Alexanderpl."
							 2:"2"
							 3:"10178"
							 4:"Berlin"
							 5:"Deutschland"
							 */
							route = route.setProperties({
								name: place.name,
								street: regexMatches[1],
								streetNr: regexMatches[2],
								zip: regexMatches[3],
								city: regexMatches[4],
								country: regexMatches[5]
							})
						}
						return route.setProperties({
							latitude: place.geometry.location.lat(),
							longitude: place.geometry.location.lng()
						});
					}
					return route;
				})];

				this.modelRoute.push(Address.create());

				//verify result
				if (place.geometry === undefined || place.geometry === null) {
					return;
				}
			});

			this.modelRoute.splice(this.modelRoute.length - 1, 1);
		});
	}

	getCenterOfTour() {
		if (!this.modelRoute) {
			return {longitude: 0, latitude: 0};
		}
		let longitude = 0;
		let latitude = 0;
		this.modelRoute.forEach(tourRoute => {
			longitude += tourRoute.longitude;
			latitude += tourRoute.latitude;
		});
		longitude /= this.modelRoute.length;
		latitude /= this.modelRoute.length;

		return {longitude, latitude};
	}
}

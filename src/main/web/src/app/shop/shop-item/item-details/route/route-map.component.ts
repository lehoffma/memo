import {Component, Inject, Input, OnInit, PLATFORM_ID} from "@angular/core";
import {Address} from "../../../../shared/model/address";
import {RoutingService} from "../../../shared/services/routing.service";
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {isPlatformServer} from "@angular/common";

@Component({
	selector: "memo-route-map",
	templateUrl: "./route-map.component.html",
	styleUrls: ["./route-map.component.scss"]
})
export class RouteMapComponent implements OnInit {
	_tourRoute$: BehaviorSubject<Address[]>                            = new BehaviorSubject([]);
	centerOfTour$: Observable<{ latitude: number, longitude: number }> = this._tourRoute$
		.pipe(
			map(route => this.routingService.centerOfRoute(route))
		);

	constructor(@Inject(PLATFORM_ID) private platformId: Object,
				private routingService: RoutingService) {
	}

	@Input() set tourRoute(tourRoute: Address[]) {
		this._tourRoute$.next(tourRoute);
	}

	ngOnInit() {
	}

	openRouteOnGoogleMaps(route: Address[]) {
		if (isPlatformServer(this.platformId)) {
			return
		}

		const directionsUrl = this.routingService.getDirectionsUrl(route);

		window.open(directionsUrl, "_blank");
	}

}

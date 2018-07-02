import {Component, Input, OnInit} from "@angular/core";
import {Address} from "../../../../shared/model/address";
import {RoutingService} from "../../../shared/services/routing.service";
import {BehaviorSubject, Subject} from "rxjs";
import {map} from "rxjs/operators";

enum AddressDisplayFormat {
	Short = "short",
	Long = "long"
}

@Component({
	selector: "memo-route-list",
	templateUrl: "./route-list.component.html",
	styleUrls: ["./route-list.component.scss"]
})
export class RouteListComponent implements OnInit {
	_route$: Subject<Address[]> = new BehaviorSubject([]);

	addressFormats = AddressDisplayFormat;

	googleMapsUrls$ = this._route$
		.pipe(
			map(route => route.map(address => this.routingService.getGoogleMapsUrl(address)))
		);

	routeFormats: AddressDisplayFormat[] = [];

	/**
	 */

	constructor(private routingService: RoutingService) {
	}

	@Input() set route(route: Address[]) {
		this._route$.next(route);
		this.routeFormats = route.map(it => AddressDisplayFormat.Short);
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param {number} index
	 */
	toggleFormat(index: number) {
		let currentValue = this.routeFormats[index];
		switch (currentValue) {
			case AddressDisplayFormat.Short:
				currentValue = AddressDisplayFormat.Long;
				break;
			case AddressDisplayFormat.Long:
				currentValue = AddressDisplayFormat.Short;
				break;
		}
		this.routeFormats[index] = currentValue;
	}
}

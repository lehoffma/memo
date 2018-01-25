import {Component, Input, OnInit} from '@angular/core';
import {Address} from "../../../../shared/model/address";
import {RoutingService} from "../../../shared/services/routing.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {map} from "rxjs/operators";

enum AddressDisplayFormat {
	Short = "short",
	Long = "long"
}

@Component({
	selector: 'memo-route-list',
	templateUrl: './route-list.component.html',
	styleUrls: ['./route-list.component.scss']
})
export class RouteListComponent implements OnInit {
	_route$: Subject<Address[]> = new BehaviorSubject([]);

	addressFormats = AddressDisplayFormat;

	googleMapsUrls$ = this._route$
		.pipe(
			map(route => route.map(address => this.routingService.getGoogleMapsUrl(address)))
		);

	routeFormats: AddressDisplayFormat[] = [];

	@Input() set route(route: Address[]) {
		this._route$.next(route);
		this.routeFormats = route.map(it => AddressDisplayFormat.Short);
	}

	/**
	 * Todo: list of route stops
	 */

	constructor(private routingService: RoutingService) {
	}


	ngOnInit() {
		this.route = [
			Address.create().setProperties({
				street: "Otto-von-Guericke-Str.",
				streetNr: "46a",
				city: "Magdeburg",
				country: "Deutschland"
			}),
			Address.create().setProperties({
				street: "Walther-Rathenau-Str.",
				streetNr: "75",
				city: "Magdeburg",
				country: "Deutschland"
			}),
			Address.create().setProperties({
				street: "Steinbeker Straße",
				streetNr: "78",
				city: "Wolfsburg",
				country: "Deutschland"
			}),
			Address.create().setProperties({
				street: "Rykestraße",
				streetNr: "7",
				city: "Berlin",
				country: "Deutschland"
			})
		]
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

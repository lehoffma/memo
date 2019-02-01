import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";
import {Address} from "../../model/address";
import {RoutingService} from "../../../shop/shared/services/routing.service";

@Component({
	selector: "memo-event-destination-renderer",
	templateUrl: "./event-destination-renderer.component.html",
	styleUrls: ["./event-destination-renderer.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventDestinationRendererComponent implements OnInit {
	@Input() miles: number;

	_destination: Address;
	@Input() set destination(addr: Address) {
		this._destination = addr;
		if (!this.tourUrl && addr) {
			this.tourUrl = this.routingService.getGoogleMapsUrl(addr);
		}
	}

	get destination() {
		return this._destination;
	}

	_tour = [];
	tourUrl = "";

	get tour() {
		return this._tour;
	}

	@Input() set tour(tour: Address[]) {
		if (tour) {
			this._tour = tour;
			this.tourUrl = this.routingService.getDirectionsUrl(tour);
		}
	}


	constructor(private routingService: RoutingService) {
	}

	ngOnInit() {
		if ((!this._tour || this._tour.length === 0) && this.destination) {
			this.tourUrl = this.routingService.getGoogleMapsUrl(this.destination);
		}
	}
}

import {Component, Input, OnInit} from "@angular/core";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {Address} from "../../../../shared/model/address";

@Component({
	selector: "memo-route",
	templateUrl: "./route.component.html",
	styleUrls: ["./route.component.scss"]
})
export class RouteComponent implements OnInit {
	@Input() tourRoute: Address[];

	constructor(private navigationService: NavigationService) {
	}

	ngOnInit() {
	}

	getCenterOfRoute() {
		let longitude = 0;
		let latitude = 0;
		this.tourRoute.forEach(tourRoute => {
			longitude += tourRoute.longitude;
			latitude += tourRoute.latitude;
		});
		longitude /= this.tourRoute.length;
		latitude /= this.tourRoute.length;

		return {
			longitude,
			latitude
		}
	}

	openRouteOnGoogleMaps() {
		this.navigationService.redirectToTour = this.tourRoute;
		this.navigationService.navigateByUrl("redirect");
	}

}

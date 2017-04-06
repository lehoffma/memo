import {Component, Input, OnInit} from "@angular/core";
import {NavigationService} from "../../../shared/services/navigation.service";

@Component({
	selector: "memo-route",
	templateUrl: "./route.component.html",
	styleUrls: ["./route.component.scss"]
})
export class RouteComponent implements OnInit {
	@Input() tourRoute;

	constructor(private navigationService: NavigationService) {
	}

	ngOnInit() {
	}

	openRouteOnGoogleMaps(tourRoute) {
		this.navigationService.navigateByUrl("redirect");
	}

}

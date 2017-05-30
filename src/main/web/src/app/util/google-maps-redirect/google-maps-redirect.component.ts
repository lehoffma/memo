import {Component, OnInit} from "@angular/core";
import {NavigationService} from "../../shared/services/navigation.service";
import {isNullOrUndefined} from "util";
@Component({
	selector: "memo-google-maps-redirect",
	template: "redirecting.."
})
export class GoogleMapsRedirectComponent implements OnInit {

	constructor(private navigationService: NavigationService) {

	}


	ngOnInit(): void {
		if(isNullOrUndefined(this.navigationService.redirectToTour) || this.navigationService.redirectToTour.length === 0){
			this.navigationService.navigateByUrl("");
			return;
		}

		let directionsUrl = this.navigationService.redirectToTour
			.map(tourStop => tourStop.latitude + "," + tourStop.longitude)
			.join("/");

		window.location.href = `https://www.google.de/maps/dir/${directionsUrl}`;
	}

}

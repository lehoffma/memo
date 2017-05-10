import {Component, OnInit} from "@angular/core";
@Component({
	selector: "memo-google-maps-redirect",
	template: "redirecting.."
})
export class GoogleMapsRedirectComponent implements OnInit {

	constructor() {

	}


	ngOnInit(): void {
		//todo
		const tourRoute = {
			from: {
				latitude: 52.422650,
				longitude: 10.786546
			},
			to: {
				latitude: 53.0664330,
				longitude: 8.837605
			},
			center: function () {
				return {
					latitude: (this.from.latitude + this.to.latitude) / 2,
					longitude: (this.from.longitude + this.to.longitude) / 2
				}
			}
		};
		window.location.href =
			`https://www.google.de/maps/dir/${tourRoute.from.latitude},${tourRoute.from.longitude}
            /${tourRoute.to.latitude},${tourRoute.to.longitude}`


	}

}

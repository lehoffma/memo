import {Injectable, NgZone} from "@angular/core";
import {GoogleMapsAPIWrapper, MapsAPILoader} from "@agm/core";
import {Observable} from "rxjs/Observable";
import {MapsGeocodingResult} from "../maps-geocoding-result";

declare var google: any;

@Injectable()
export class GMapsService extends GoogleMapsAPIWrapper {
	constructor(private __loader: MapsAPILoader, private __zone: NgZone) {
		super(__loader, __zone);
	}

	getGeocodedAddress(address: string): Observable<MapsGeocodingResult[]>{
		console.log("Getting Address - ", address);
		let geocoder = new google.maps.Geocoder();
		return Observable.create(observer => {
			geocoder.geocode({"address": address}, (results, status) => {
				if (status == google.maps.GeocoderStatus.OK) {
					observer.next(results);
					observer.complete();
				} else {
					console.log("Error - ", results, " & Status - ", status);
					observer.next({});
					observer.complete();
				}
			});
		})
	}
}

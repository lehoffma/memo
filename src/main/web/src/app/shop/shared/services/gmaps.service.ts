import {Injectable, NgZone} from "@angular/core";
import {GoogleMapsAPIWrapper, MapsAPILoader} from "@agm/core";
import {Observable} from "rxjs";
import {MapsGeocodingResult} from "../maps-geocoding-result";

declare var google;

@Injectable()
export class GMapsService extends GoogleMapsAPIWrapper {
	constructor(private __loader: MapsAPILoader, private __zone: NgZone) {
		super(__loader, __zone);
	}

	getGeocodedAddress(address: string): Observable<MapsGeocodingResult[]> {
		console.log("Getting Address - ", address);
		return Observable.create(observer => {
			try {
				//if we don't call load(), the google variable might still be undefined on startup
				this.__loader.load().then(() => {
					let geocoder = new google.maps.Geocoder();
					geocoder.geocode({"address": address}, (results, status) => {
						if (status == google.maps.GeocoderStatus.OK) {
							observer.next(results);
							observer.complete();
						} else {
							console.log("Error - ", results, " & Status - ", status);
							observer.next([]);
							observer.complete();
						}
					});
				})
			}
			catch (error) {
				observer.error("error loading google maps service" + error);
				observer.next([]);
				observer.complete();
			}
		})
	}
}

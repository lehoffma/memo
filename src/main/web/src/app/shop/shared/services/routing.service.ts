import {Injectable} from "@angular/core";
import {Address} from "../../../shared/model/address";
import {AddressComponentType} from "../maps-address-component-type";
import {AddressComponent} from "../maps-address-component";
import {setProperties} from "../../../shared/model/util/base-object";

@Injectable()
export class RoutingService {

	constructor() {
	}

	/**
	 * Calculates the center of the route (i.e. a list of addresses)
	 * @param {Address[]} route
	 * @returns {{longitude: number; latitude: number}}
	 */
	centerOfRoute(route: Address[]) {
		//filter out unused or falsely initialized waypoints
		const initializedRoute = route
			? route
				.filter(it => it.latitude !== 0 && it.longitude !== 0)
			: [];

		if (initializedRoute.length === 0) {
			return {longitude: 0, latitude: 0};
		}

		//take the average of both longitude and latitude
		let longitude = 0;
		let latitude = 0;
		initializedRoute.forEach(tourRoute => {
			longitude += tourRoute.longitude;
			latitude += tourRoute.latitude;
		});

		const length = initializedRoute.length;
		longitude /= length;
		latitude /= length;

		return {longitude, latitude};
	}

	/**
	 *
	 * @param place
	 * @param {Address} address
	 * @returns {Address<Address>}
	 */
	transformToMemoFormat(place: any, address: Address) {
		const addressComponents: AddressComponent[] = place.address_components;

		console.log(addressComponents);
		let copy = setProperties(address, {
			street: this.findNameOfAddressComponent(addressComponents, AddressComponentType.street),
			streetNr: this.findNameOfAddressComponent(addressComponents, AddressComponentType.streetNr),
			city: this.findNameOfAddressComponent(addressComponents, AddressComponentType.city),
			country: this.findNameOfAddressComponent(addressComponents, AddressComponentType.country),
			zip: this.findNameOfAddressComponent(addressComponents, AddressComponentType.zip)
		});

		return setProperties(copy, {
			latitude: place.geometry.location.lat(),
			longitude: place.geometry.location.lng()
		});
	}


	/**
	 * Searches for a given address type and returns its long_name, if found. Returns null otherwise.
	 * @returns {string}
	 * @param components
	 * @param type
	 */
	findNameOfAddressComponent(components: AddressComponent[], type: AddressComponentType): string {
		const component = components.find(component => component.types.includes(type.toString()));
		if (component && component !== null) {
			return component.long_name;
		}
		return null;
	}

	/**
	 *
	 * @param {Address[]} route
	 * @returns {string}
	 */
	getDirectionsUrl(route: Address[]): string {
		const directionsUrl = route
			.map(tourStop => tourStop.latitude + "," + tourStop.longitude)
			.join("/");

		return `https://www.google.de/maps/dir/${directionsUrl}`;
	}

	/**
	 *
	 * @param {Address[]} address
	 * @returns {string}
	 */
	getGoogleMapsUrl(address: Address): string {
		const {longitude, latitude} = address;
		return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
	}
}

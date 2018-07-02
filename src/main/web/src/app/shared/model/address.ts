import {BaseObject} from "./util/base-object";

export interface Address extends BaseObject {
	name: string;
	street: string;
	streetNr: string;
	zip: string;
	city: string;
	country: string;
	user: number;
	item: number;
	latitude: number;
	longitude: number;

}

export function createAddress(): Address {
	return {
		id: -1,
		name: "",
		street: "",
		streetNr: "",
		zip: "",
		city: "",
		country: "",
		user: null,
		item: null,
		latitude: 0,
		longitude: 0,
	};
}

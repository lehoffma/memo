import {BaseObject} from "./util/base-object";

export class Address extends BaseObject<Address> {

	/**
	 * @param id Die ID der Adresse (nur zwischen adressen einzigartig, d.h. ein Event könnte die selber ID haben)
	 * @param name Ein der Adresse zugewiesener Name, z.B. "Alte WG"
	 * @param street Der Straßenname, z.B. Walther-Rathenau-Straße
	 * @param streetNr Die Hausnummer, z.B. 57
	 * @param zip Die Postleitzahl, z.B. 39104
	 * @param city Die Stadt, z.B. Magdeburg
	 * @param country Das Land, z.B. Deutschland
	 * @param latitude Breitengrad
	 * @param longitude Längengrad
	 */
	constructor(public id: number,
				public name: string,
				public street: string,
				public streetNr: string,
				public zip: string,
				public city: string,
				public country: string,
				public latitude: number,
				public longitude: number) {
		super(id);
	}

	static create() {
		return new Address(-1, "", "", "", "", "", "", 0, 0);
	}

	static isAddress(obj: any): obj is Address {
		return obj && obj.street !== undefined && obj.zip !== undefined;
	}

	toString() {
		return Address.toString(this);
	}

	static toString(address: Address) {
		const ifNotEmpty = (value: string, options: { suffix?: string, prefix?: string } = {suffix: "", prefix: ""}) => {
			return !value ? "" : ifNotEmpty(options && options.prefix) + value + ifNotEmpty(options && options.suffix);
		};

		return address.street + ifNotEmpty(address.streetNr, {prefix: " "}) + ", "
			+ ifNotEmpty(address.zip, {suffix: " "}) + address.city + ", " + address.country;
	}
}

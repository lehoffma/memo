import {ImmutableObject} from "./util/immutable-object";

export class Address extends ImmutableObject<Address> {

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
				//todo: name des menschen an den die rechnung geht, oder ist das "name"?
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
		return obj.street !== undefined && obj.zip !== undefined;
	}
}

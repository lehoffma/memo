export class Address {

	constructor(private _addressID: number = 9999,
				private _name: string = "default",
				private _street: string = "default",
				private _streetNr: string = "9999",
				private _zip: string = "default",
				private _city: string = "default",
				private _country: string = "Germany",) {


	}

	get id(): number {
		return this._addressID;
	}

	get name(): string {
		return this._name;
	}

	get street(): string {
		return this._street;
	}

	get streetNr(): string {
		return this._streetNr;
	}

	get zip(): string {
		return this._zip;
	}

	get city(): string {
		return this._city;
	}

	get country(): string {
		return this._country;
	}

	set id(value: number) {
		this._addressID = value;
	}

	set name(value: string) {
		this._name = value;
	}

	set street(value: string) {
		this._street = value;
	}

	set streetNr(value: string) {
		this._streetNr = value;
	}

	set zip(value: string) {
		this._zip = value;
	}

	set city(value: string) {
		this._city = value;
	}

	set country(value: string) {
		this._country = value;
	}

}

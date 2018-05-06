export class Filter {
	[key: string]: string;

	constructor(filters: { [key: string]: string }) {
		Object.assign(this, filters);
	}

	static by(filters: { [key: string]: string }): Filter {
		return new Filter(filters);
	}

	static none(): Filter {
		return new Filter({});
	}
}

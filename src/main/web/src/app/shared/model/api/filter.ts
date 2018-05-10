export class Filter {
	[key: string]: string;

	constructor(filters: { [key: string]: string }) {
		Object.assign(<any>this, filters);
	}

	static add(filter: Filter, key: string, value: string): Filter {
		filter[key] = value;
		return filter;
	}

	static by(filters: { [key: string]: string }): Filter {
		return new Filter(filters);
	}

	static none(): Filter {
		return new Filter({});
	}

	static combine(...filters: Filter[]): Filter {
		return filters.reduce((acc: Filter, filter: Filter) => {
			Object.keys(filter).forEach(key => {
				if (!acc[key]) {
					acc[key] = filter[key];
				}
				else {
					const values = acc[key].split("|");
					if (!values.includes(filter[key])) {
						acc[key] += "|" + filter[key];
					}
				}
			});
			return acc;

		}, Filter.none())
	}
}

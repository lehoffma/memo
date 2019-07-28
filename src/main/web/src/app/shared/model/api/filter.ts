import {isNullOrUndefined} from "util";

export class Filter {
	[key: string]: string;

	constructor(filters: { [key: string]: string }) {
		Object.assign(<any>this, filters);
	}

	static equal(filterA: Filter, filterB: Filter): boolean {
		return Object.keys(filterA).every(key => filterA[key] === filterB[key])
			&& Object.keys(filterB).every(key => filterA[key] === filterB[key]);
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
			if (!filter) {
				return acc;
			}

			Object.keys(filter).forEach(key => {
				if (!acc[key]) {
					acc[key] = filter[key];
				} else {
					const values = acc[key].split(",");
					if (!values.includes(filter[key])) {
						acc[key] += "," + filter[key];
					}
				}
			});
			return acc;

		}, Filter.none())
	}
}


export class FilterBuilder {
	private filters: Filter[] = [];

	add<T>(key: string, value: T | undefined | null, toString: (input: T) => string = input => input.toString()): FilterBuilder {
		if (isNullOrUndefined(value)) {
			return this;
		}

		this.filters.push(Filter.by({[key]: toString(value)}));
		return this;
	}

	build() {
		return Filter.combine(...this.filters)
	}
}

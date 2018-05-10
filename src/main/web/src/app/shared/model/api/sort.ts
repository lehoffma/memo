import {SortDirection} from "@angular/material";

export enum Direction {
	ASCENDING = "asc",
	DESCENDING = "desc",
	NONE = ""
}

export class Sort {
	direction: Direction;
	sortBys: string[];

	constructor(direction: Direction, by: string[]) {
		this.direction = direction;
		this.sortBys = by;
	}

	static by(direction: Direction, ...properties: string[]) {
		return new Sort(direction, properties);
	}


	static by(direction: SortDirection, ...properties: string[]) {
		let sortDirection =
			direction === "asc"
				? Direction.ASCENDING
				: direction === "desc"
				? Direction.DESCENDING
				: Direction.NONE;

		return new Sort(sortDirection, properties);
	}

	static from(sort: { active: string, direction: SortDirection }): Sort {
		if (sort.direction === "") {
			return Sort.none();
		}

		return Sort.by(sort.direction, sort.active);
	}


	static none() {
		return new Sort(Direction.NONE, []);
	}
}

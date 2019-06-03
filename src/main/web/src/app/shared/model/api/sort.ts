import { SortDirection } from "@angular/material/sort";

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

	static by(direction: SortDirection | Direction | string, ...properties: string[]) {
		let sortDirection;
		let stringDirection = (direction || "").toString();

		sortDirection = stringDirection === "asc"
			? Direction.ASCENDING
			: stringDirection === "desc"
				? Direction.DESCENDING
				: Direction.NONE;

		return new Sort(sortDirection, properties);
	}

	static equal(sortA: Sort, sortB: Sort): boolean{
		return sortA.direction === sortB.direction
			&& sortA.sortBys.every((it, i) => sortB.sortBys[i] === it)
			&& sortB.sortBys.every((it, i) => sortA.sortBys[i] === it)
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

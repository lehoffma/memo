import {SortDirection} from "@angular/material";

export enum SortDirectionEnum {
	ASCENDING = "asc",
	DESCENDING = "desc",
	NONE = ""
}

export class Sort {
	direction: SortDirectionEnum;
	sortBys: string[];

	constructor(direction: SortDirectionEnum, by: string[]) {
		this.direction = direction;
		this.sortBys = by;
	}

	static by(direction: SortDirectionEnum, ...properties: string[]) {
		return new Sort(direction, properties);
	}


	static by(direction: SortDirection, ...properties: string[]) {
		let sortDirection =
			direction === "asc"
				? SortDirectionEnum.ASCENDING
				: direction === "desc"
				? SortDirectionEnum.DESCENDING
				: SortDirectionEnum.NONE;

		return new Sort(sortDirection, properties);
	}

	static from(sort: { active: string, direction: SortDirection }): Sort {
		if (sort.direction === "") {
			return Sort.none();
		}

		return Sort.by(sort.direction, sort.active);
	}


	static none() {
		return new Sort(SortDirectionEnum.NONE, []);
	}
}

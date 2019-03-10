import {Sort} from "./api/sort";

export interface SortingOption<T> {
	name: string;
	shortName: string;
	queryParameters: {
		[param: string]: string;
	};
}

export class SortingOptionHelper {
	static build<T>(name: string, sort: Sort, shortName: string = name): SortingOption<T> {
		return {
			name,
			shortName,
			queryParameters: {
				direction: sort.direction,
				sortBy: sort.sortBys.join(",")
			}
		}
	}
}

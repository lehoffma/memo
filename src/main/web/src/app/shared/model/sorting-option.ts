import {Sort} from "./api/sort";

export interface SortingOption<T> {
	name: string;
	queryParameters: {
		[param: string]: string;
	};
}

export class SortingOptionHelper {
	static build<T>(name: string, sort: Sort): SortingOption<T> {
		return {
			name,
			queryParameters: {
				direction: sort.direction,
				sortBy: sort.sortBys.join("|")
			}
		}
	}
}

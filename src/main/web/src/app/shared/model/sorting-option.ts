export interface SortingOption<T> {
	name: string;
	queryParameters: {
		[param: string]: string;
	};
	sortingFunction: (a: T, b: T) => number;
}

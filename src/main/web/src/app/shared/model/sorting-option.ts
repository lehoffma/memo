export interface SortingOption<T> {
	name: string;
	queryParameters: {
		[param: string]: string;
	};
}

export interface FilterOption<T> {
	name: string;
	filterFunction: (object: T) => boolean;
}

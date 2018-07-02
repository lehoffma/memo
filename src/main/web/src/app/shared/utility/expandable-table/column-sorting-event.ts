//todo remove
export interface ColumnSortingEvent<T> {
	key: keyof T;
	descending: boolean;
}

/**
 * Type that describes an object whose properties are all arrays
 */
export type ArrayObjectType<T> = {
	[key: string]: Array<T>
}

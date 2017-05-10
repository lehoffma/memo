import {isNullOrUndefined} from "util";

export type SortingFunction<T> = (a: T, b: T) => number;


export function attributeSortingFunction<ObjectType>(attribute: string, descending: boolean): SortingFunction<ObjectType> {
	return sortingFunction(obj => obj[attribute], descending);
}

export function sortingFunction<ObjectType>(getAttribute: (obj: ObjectType) => any,
											descending: boolean): SortingFunction<ObjectType> {
	return (a, b) => {
		let valueA = getAttribute(a),
			valueB = getAttribute(b);

		if (isString(valueA) && isString(valueB)) {
			valueA = valueA.toLowerCase();
			valueB = valueB.toLowerCase();
		}

		if (!isNullOrUndefined(valueA) && !isNullOrUndefined(valueB)) {
			const descendingMultiplier = descending ? -1 : 1;
			if (valueA < valueB) {
				return -1 * descendingMultiplier;
			}
			if (valueA > valueB) {
				return descendingMultiplier;
			}
		}

		return 0;
	}
}

export function isString(value: any): value is string {
	return value && (<string>value).toLowerCase !== undefined;
}

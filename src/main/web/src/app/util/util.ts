import {isArray, isNullOrUndefined} from "util";
import {Observable} from "rxjs";
import {isAfter, isBefore} from "date-fns";

export type SortingFunction<T> = (a: T, b: T) => number;

export const NOW: Date = new Date();

export function attributeSortingFunction<ObjectType>(attribute: string, descending: boolean): SortingFunction<ObjectType> {
	return sortingFunction(obj => obj[attribute], descending);
}

export function dateSortingFunction<ObjectType>(getAttribute: (obj: ObjectType) => Date, descending: boolean): SortingFunction<ObjectType> {
	return (a, b) => {
		let dateA = getAttribute(a),
			dateB = getAttribute(b);

		const descendingMultiplier = descending ? -1 : 1;
		if (isBefore(dateA, dateB)) {
			return -1 * descendingMultiplier;
		}
		if (isAfter(dateA, dateB)) {
			return descendingMultiplier;
		}

		return 0;
	};
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

export function combinedSortFunction<T>(...functions: SortingFunction<T>[]): SortingFunction<T> {
	return (a, b) => {
		let value: number = 0;
		const sortingFunctions = [...functions];
		while (sortingFunctions.length > 0 && (value === 0)) {
			const sortingFunction: SortingFunction<T> = sortingFunctions.splice(0, 1)[0];
			value = sortingFunction(a, b);
		}
		return value;
	}
}

export function isString(value: any): value is string {
	return value && (<string>value).toLowerCase !== undefined;
}

export function isNumber(value: any): value is number {
	return !isNaN(parseFloat(value)) && isFinite(value);
}


export function getId(object: any): number {
	let getHashOfString = (stringValue: string) => {
		let hash = 0;
		if (stringValue.length == 0) return hash;
		for (let i = 0; i < stringValue.length; i++) {
			const character = stringValue.charCodeAt(i);
			hash = ((hash << 5) - hash) + character;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	};

	let getHashOfObject = (obj) => {
		return Object.keys(obj)
			.reduce((acc, objectKey) => {
				if (isString(obj[objectKey]) || isNumber(obj[objectKey])) {
					return acc + getHashOfString(obj[objectKey] + "")
				}
				return acc + getHashOfObject(obj[objectKey]);
			}, 0);
	};

	return getHashOfObject(object);
}

export function isObservable(value: any): value is Observable<any> {
	return (<Observable<any>>value).subscribe !== undefined;
}


const concat = (x, y) =>
	x.concat(y);

export const flatten = list => list.reduce(
	(a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

export function flatMap<T, U>(f: (val: T) => U[], xs: T[]): U[] {
	return xs.map(f).reduce(concat, []);
}


export function isArrayType(value): value is any[] {
	return isArray(value);
}

/**
 * Checks if any of the values associated with their keys don't match on both values
 * @param {T} previous
 * @param {T} updated
 * @param except
 * @returns {boolean}
 */
export function isEdited<T>(previous: T, updated: T, except?: string[]): boolean {
	let keys = Object.keys(previous);
	if (except) {
		keys = keys.filter(key => !except.includes(key));
	}

	return keys.some(key => previous[key] !== updated[key]);
}


export function arrayIsEqual<T>(left: T[], right: T[]): boolean {
	if (left.length !== right.length) {
		return false;
	}
	return left.every(leftObject => right.some(rightObject => isEdited(leftObject, rightObject)))
}

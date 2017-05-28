import {isNullOrUndefined, isNumber} from "util";

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


export function getId(object:any):number{
	let getHashOfString = (stringValue:string) => {
		let hash = 0;
		if (stringValue.length == 0) return hash;
		for (let i = 0; i < stringValue.length; i++) {
			const character = stringValue.charCodeAt(i);
			hash = ((hash<<5)-hash)+character;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	};

	let getHashOfObject = (obj) => {
		return Object.keys(obj)
			.reduce((acc, objectKey) => {
				if(isString(obj[objectKey]) || isNumber(obj[objectKey])){
					return acc + getHashOfString(obj[objectKey] + "")
				}
				return acc + getHashOfObject(obj[objectKey]);
			}, 0);
	};

	return getHashOfObject(object);
}

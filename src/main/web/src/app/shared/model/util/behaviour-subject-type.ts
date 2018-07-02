import {BehaviorSubject} from "rxjs";

export type BehaviorSubjectType<T> = {
	[P in keyof T]: BehaviorSubject<T[P]>;
};


export function asValues<T>(subject: BehaviorSubjectType<T>): T {
	const values: any = {};

	Object.keys(subject).forEach((key: keyof BehaviorSubjectType<T>) => values[key] = subject[key].getValue());


	return values;
}

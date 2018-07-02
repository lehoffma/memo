import {BehaviorSubjectType} from "./behaviour-subject-type";
import {Observable} from "rxjs";

export type ObservableType<T> = {
	[P in keyof T]: Observable<T[P]>;
};


export function asObservableType<T>(subjectType: BehaviorSubjectType<T>): ObservableType<T> {
	let observableType: any = {};

	Object.keys(subjectType).forEach((key: keyof BehaviorSubjectType<T>) => observableType[key] = subjectType[key].asObservable());

	return observableType;
}

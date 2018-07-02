import {Observable} from "rxjs";
import {Page} from "./api/page";
import {Sort} from "./api/sort";
import {PageRequest} from "./api/page-request";
import {Filter} from "./api/filter";

export interface ServletServiceInterface<T> {
	handleError(error: Error): Observable<any>,

	getById(id: number, options?: any): Observable<T>,

	get(filter: Filter, pageRequest: PageRequest, sort: Sort): Observable<Page<T>>,

	add(object: T, options?: any): Observable<T>,

	modify(object: T, options?: any): Observable<T>,

	remove(id: number, options?: any): Observable<Object>
}

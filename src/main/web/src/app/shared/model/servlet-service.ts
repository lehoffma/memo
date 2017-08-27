import {Observable} from "rxjs/Observable";
import {Response} from "@angular/http";

export interface ServletServiceInterface<T> {
	handleError(error: Error): Observable<any>,

	getById(id: number, options?: any): Observable<T>,

	search(searchTerm: string, options?: any): Observable<T[]>,

	add(object: T, options?: any): Observable<T>,

	modify(object: T, options?: any): Observable<T>,

	remove(id: number, options?: any): Observable<Object>
}

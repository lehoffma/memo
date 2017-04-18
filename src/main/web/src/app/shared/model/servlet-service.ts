import {Observable} from "rxjs/Observable";
import {Response} from "@angular/http";
export interface ServletService<T> {
	handleError(error: Error): Observable<any>,
	getById(id: number, options?: any): Observable<T>,
	search(searchTerm: string, options?: any): Observable<T[]>,
	add(object: T): Observable<T>,
	remove(id: number, options?: any): Observable<Response>
}

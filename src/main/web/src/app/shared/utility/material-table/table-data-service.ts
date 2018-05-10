import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {Page} from "../../model/api/page";
import {Observable} from "rxjs";

export interface TableDataService<T> {
	get(filter: Filter, pageRequest: PageRequest, sort: Sort): Observable<Page<T>>
}

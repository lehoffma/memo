import {Injectable, OnDestroy} from "@angular/core";
import {TableDataService} from "./table-data-service";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Direction, Sort} from "../../model/api/sort";
import {BehaviorSubject, Observable} from "rxjs";
import {Page, PageResponse} from "../../model/api/page";
import {attributeSortingFunction, combinedSortFunction} from "../../../util/util";
import {map} from "rxjs/operators";

@Injectable()
export class InMemoryDataService<T> implements TableDataService<T>, OnDestroy {

	subscriptions = [];
	private data: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([] as T[]);
	public data$: Observable<T[]> = this.data.asObservable();

	constructor() {
	}


	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	init(data: T[]) {
		this.data.next([...data]);
	}

	init$(data$: Observable<T[]>) {
		this.subscriptions.push(
			data$.subscribe(data => this.data.next(data))
		)
	}


	add(...values: T[]) {
		values.forEach(value => this.insert(value));
	}

	indexOfValues<U>(valuesToFind: any[], ...getValues: ((value: T) => U)[]): number {
		const data = this.data.getValue();
		const extractList = getValues ? getValues : [t => t];

		return data.findIndex(it =>
			extractList.every((getValue, i) =>
				getValue(it) === valuesToFind[i]
			)
		);
	}

	indexOf<U>(value: Partial<T>, ...getValues: ((value: Partial<T>) => U)[]): number {
		const extractList = getValues ? getValues : [t => t];
		return this.indexOfValues(extractList.map(getValue => getValue(value)), ...extractList);
	}

	insert(value: T, position: number = this.data.getValue().length - 1) {
		const data = this.data.getValue();
		data.splice(position, 1, value);
		this.data.next(data);
	}

	at(index: number) {
		return this.data.getValue()[index];
	}

	modifyPartially(value: Partial<T>, getIndex: (value: Partial<T>) => number = it => this.indexOf(it)) {
		const index = getIndex(value);

		if (index === -1) {
			console.error("This item does not exist");
			return;
		}

		const data = this.data.getValue();
		const previousValue = data[index];

		data.splice(index, 1, Object.assign({}, previousValue, value));
		this.data.next(data);
	}

	modify<U>(value: T, getIndex: (value: T) => number = it => this.indexOf(it)) {
		const index = getIndex(value);
		if (index === -1) {
			console.error("This item does not exist");
			return;
		}

		this.insert(value, index);
	}

	remove(value: T) {
		const data = this.data.getValue();
		const index = data.indexOf(value);

		if (index === -1) {
			console.error("data object " + value + " doesn't exist");
			return;
		}

		data.splice(index, 1);
		this.data.next(data);
	}


	get(filter: Filter, pageRequest: PageRequest, sort: Sort): Observable<Page<T>> {
		return this.data.pipe(
			map(data => {
				const filteredData = data
					.filter(data => Object.keys(filter).every(key => {
						const filterValue = filter[key];
						const values = filterValue.split("|");
						return values.some(value => data[key] === value);
					}));

				const sortedData = filteredData.sort(
					combinedSortFunction(
						...sort.sortBys
							.map(sortBy =>
								attributeSortingFunction(sortBy, sort.direction === Direction.DESCENDING)
							)
					)
				);

				const pageStart = pageRequest.page * pageRequest.pageSize;
				const pageEnd = (pageRequest.page + 1) * pageRequest.pageSize;
				const paginatedData = sortedData.slice(pageStart, pageEnd);

				return PageResponse.from(paginatedData, data.length, pageRequest);
			})
		)
	}
}

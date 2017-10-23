import {TableActionEvent} from "./table-action-event";
import {RowAction} from "./row-action";
import {BehaviorSubject, Observable, Subscription} from "rxjs/Rx";
import {ExpandableTableColumn} from "./expandable-table-column";
import {OnDestroy, Type} from "@angular/core";
import {ExpandedRowComponent} from "./expanded-row.component";
import {SingleValueListExpandedRowComponent} from "./single-value-list-expanded-row/single-value-list-expanded-row.component";
import {ColumnSortingEvent} from "./column-sorting-event";
import {ActionPermissions} from "./expandable-table.component";
import {SortingFunction} from "../../util/util";

export abstract class ExpandableTableContainerService<T> implements OnDestroy {
	private _sortBy$ = new BehaviorSubject<ColumnSortingEvent<T>>(null);

	primaryColumnKeys$: BehaviorSubject<ExpandableTableColumn<T>[]> = new BehaviorSubject([]);
	expandedRowKeys$: BehaviorSubject<ExpandableTableColumn<T>[]> = new BehaviorSubject([]);

	dataSubject$: BehaviorSubject<T[]> = new BehaviorSubject([]);
	data$ = Observable.combineLatest(
		this.dataSubject$,
		this._sortBy$,
		...this.options$,
	)
		.map(([data, sortBy, ...options]: [T[], ColumnSortingEvent<T>, any[]]) => data
			.filter(dataObject => this.satisfiesFilter(dataObject, ...options))
			.sort((a,b) => this.comparator(sortBy)(a,b))
		)
		.map(data => [...data])
		.defaultIfEmpty([]);

	private dataSubscription: Subscription;

	constructor(sortBy: ColumnSortingEvent<T>,
				public permissions$: Observable<ActionPermissions>,
				public options$: Observable<any>[],
				public rowComponent: Type<ExpandedRowComponent<T>> = SingleValueListExpandedRowComponent) {

		this._sortBy$.next(sortBy);
	}

	public init(dataSource$: Observable<T[]>) {
		this.dataSubscription = dataSource$
			.subscribe(data => this.dataSubject$.next(data));
	}

	ngOnDestroy() {
		this.dataSubscription.unsubscribe();
	}

	/**
	 * Adds an object to the data list
	 */
	abstract add(): void;

	/**
	 * Edits the given object
	 * @param {T} entry
	 */
	abstract edit(entry: T): void;

	/**
	 * Removes the list of objects
	 * @param {T[]} entries
	 */
	abstract remove(entries: T[]): void;

	/**
	 * Defines a filter function for the data set
	 * @param entry
	 * @param options
	 * @returns {T[]}
	 */
	abstract satisfiesFilter(entry: T, ...options): boolean;

	/**
	 * Defines a sorting function for the data set
	 * @param {ColumnSortingEvent<T>} sortBy
	 * @param options
	 * @returns {T[]}
	 */
	abstract comparator(sortBy: ColumnSortingEvent<T>, ...options): SortingFunction<T>


	/**
	 * Sorting callback, which pushes the event into the sortBy stream
	 * @param {ColumnSortingEvent<T>} event
	 */
	onSort(event: ColumnSortingEvent<T>) {
		this._sortBy$.next(event);
	}


	/**
	 * Callback for every table's action
	 * @param {TableActionEvent<Entry>} event
	 * @returns {any}
	 */
	handleTableAction(event: TableActionEvent<T>) {
		switch (event.action) {
			case RowAction.ADD:
				return this.add();
			case RowAction.EDIT:
				return this.edit(event.entries[0]);
			case RowAction.DELETE:
				return this.remove(event.entries);
		}
	}
}

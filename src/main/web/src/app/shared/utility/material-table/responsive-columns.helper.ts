import {TableColumn} from "./expandable-material-table.component";
import {BreakpointObserver} from "@angular/cdk/layout";
import {map, tap} from "rxjs/operators";
import {combineLatest, Observable} from "rxjs";


export class ResponsiveColumnsHelper<T> {

	private columnBreakpointMap: Map<string, string> = new Map();
	private observedBreakpoints: Set<string> = new Set<string>();

	constructor(private columns: TableColumn<T>[],
				private breakpointObserver: BreakpointObserver) {
	}

	add(breakpoint: string, ...columnDefs: string[]) {
		columnDefs.forEach(columnDef => this.columnBreakpointMap.set(columnDef, breakpoint));
		this.observedBreakpoints.add(breakpoint);
	}

	addPixelBreakpoint(pixel: number, ...columnDefs: string[]) {
		// '(min-width: 500px)'
		const breakpoint = "(min-width: " + pixel + "px)";
		this.add(breakpoint, ...columnDefs);
	}

	/**
	 *
	 * @param {string} breakpoint
	 * @returns {any[]}
	 */
	getColumnDefsOfBreakpoint(breakpoint: string) {
		const columnDefs = [];
		for (let [key, value] of Array.from(this.columnBreakpointMap.entries())) {
			if (value === breakpoint) {
				columnDefs.push(key);
			}
		}
		return columnDefs;
	}

	/**
	 *
	 * @returns {string[]}
	 */
	getAlwaysAvailableColumndefs(): string[] {
		const columnDefs = this.columns.map(it => it.columnDef);
		for (let [key, value] of Array.from(this.columnBreakpointMap.entries())) {
			const index = columnDefs.indexOf(key);
			if (index >= 0) {
				columnDefs.splice(index, 1);
			}
		}
		return columnDefs;
	}


	/**
	 *
	 * @returns {Observable<TableColumn<T>[]>}
	 */
	build(): Observable<string[]> {
		const observedBreakpoints = Array.from(this.observedBreakpoints.values());

		return combineLatest(
			...observedBreakpoints
				.map(breakpoint =>
					this.breakpointObserver.observe(breakpoint).pipe(
						map(result => {
							if (!result.matches) {
								return [];
							}
							return this.getColumnDefsOfBreakpoint(breakpoint);
						})
					)
				)
		).pipe(
			map((columnRefListList: string[][]) => {
				const alwaysAvailableColumns = this.getAlwaysAvailableColumndefs();

				//flatten into single array without duplicates
				const flattenedList = columnRefListList.reduce((a, b) => a.concat(b), []);
				const columnSet = new Set(flattenedList);
				const matchedColumnRefs = Array.from(columnSet.values());

				return [
					...alwaysAvailableColumns,
					...matchedColumnRefs
				]
			}),
			tap(it => console.log(it)),
		);
	}
}

import {TableColumn} from "./expandable-material-table.component";
import {BreakpointObserver} from "@angular/cdk/layout";
import {map} from "rxjs/operators";
import {combineLatest, Observable} from "rxjs";


export class ResponsiveColumnsHelper<T> {

	private columnBreakpointMap: Map<string, string> = new Map();
	private observedBreakpoints: Set<string> = new Set<string>();

	constructor(private columns: TableColumn<T>[],
				private breakpointObserver: BreakpointObserver) {
	}

	add(breakpoint: string, columnDef: string) {
		this.columnBreakpointMap.set(columnDef, breakpoint);
		this.observedBreakpoints.add(breakpoint);
	}

	getColumnRefsOfBreakpoint(breakpoint: string) {
		const columnRefs = [];
		for (let [key, value] of this.columnBreakpointMap) {
			if (value === breakpoint) {
				columnRefs.push(key);
			}
		}
		return columnRefs;
	}

	build(): Observable<TableColumn<T>[]> {
		const observedBreakpoints = Array.from(this.observedBreakpoints.values());

		return combineLatest(
			...observedBreakpoints
				.map(breakpoint =>
					this.breakpointObserver.observe(breakpoint).pipe(
						map(result => {
							if (!result.matches) {
								return [];
							}
							return this.getColumnRefsOfBreakpoint(breakpoint);
						})
					)
				)
		).pipe(
			//todo return if no breakpoint was registered for that column
			map((columnRefListList: string[][]) => {
				//flatten into single array without duplicates
				const columnRefs = [...new Set(columnRefListList.reduce((a, b) => a.concat(b), []))];
				return columnRefs
					.map(ref => this.columns.find(it => it.columnDef === ref))
					.filter(it => it !== undefined);
			})
		);
	}

}

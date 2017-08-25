import {
	AfterViewInit,
	Component,
	ComponentFactoryResolver,
	Input,
	OnInit,
	QueryList,
	ViewChildren
} from "@angular/core";
import {ExpandedRowComponent} from "../expanded-row.component";
import {ExpandableTableColumn} from "../expandable-table-column";
import {ExpandableTableColumnContainerDirective} from "../expandable-table-column-container.directive";
import {ArrayObjectType} from "../../model/util/array-object-type";

@Component({
	selector: "tbody [memoMultiValueListExpandedRow]",
	templateUrl: "./multi-value-list-expanded-row.component.html",
	styleUrls: ["./multi-value-list-expanded-row.component.scss"]
})
export class MultiValueListExpandedRowComponent<T extends ArrayObjectType<any>> implements OnInit, AfterViewInit, ExpandedRowComponent<T> {
	@Input() data: T;
	@Input() keys: ExpandableTableColumn<T>[];

	@ViewChildren(ExpandableTableColumnContainerDirective) tableCellList: QueryList<ExpandableTableColumnContainerDirective>;

	constructor(private _componentFactoryResolver: ComponentFactoryResolver) {
	}

	ngOnInit() {
	}

	ngAfterViewInit(): void {
		this.initTableCells(this.tableCellList, this.keys);
	}


	/**
	 * Initializes the table cell components
	 * @param tableCellList
	 * @param keys
	 */
	initTableCells(tableCellList: QueryList<ExpandableTableColumnContainerDirective>, keys: ExpandableTableColumn<T>[]) {
		let index = 0;
		keys.forEach(columnKey => {
			let componentFactory = this._componentFactoryResolver.resolveComponentFactory(columnKey.component);

			this.data[columnKey.key].forEach(dataObject => {
				let viewContainerRef = tableCellList.toArray()[index].viewContainerRef;

				//remove previous view
				viewContainerRef.clear();

				//create new view and set the data attribute
				let componentRef = viewContainerRef.createComponent(componentFactory);
				componentRef.instance.data = dataObject;
				componentRef.changeDetectorRef.detectChanges();

				index++;
			})
		})
	}
}

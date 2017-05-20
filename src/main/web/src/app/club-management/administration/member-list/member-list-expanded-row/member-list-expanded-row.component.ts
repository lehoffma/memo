import {AfterViewInit, Component, ComponentFactoryResolver, Input, OnInit, QueryList, ViewChildren} from "@angular/core";
import {ExpandedRowComponent} from "../../../../shared/expandable-table/expanded-row.component";
import {User} from "../../../../shared/model/user";
import {ExpandableTableColumn} from "../../../../shared/expandable-table/expandable-table-column";
import {ExpandableTableColumnContainerDirective} from "../../../../shared/expandable-table/expandable-table-column-container.directive";

@Component({
	selector: "tbody [memberListExpandedRow]",
	templateUrl: "./member-list-expanded-row.component.html",
	styleUrls: ["./member-list-expanded-row.component.scss"]
})
export class MemberListExpandedRowComponent implements OnInit, AfterViewInit, ExpandedRowComponent<User> {
	@Input() data: User;
	@Input() keys: ExpandableTableColumn<User>[];

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
	initTableCells(tableCellList: QueryList<ExpandableTableColumnContainerDirective>, keys: ExpandableTableColumn<User>[]) {
		let index = 0;
		keys.forEach(columnKey => {
			let componentFactory = this._componentFactoryResolver.resolveComponentFactory(columnKey.component);

			let viewContainerRef = tableCellList.toArray()[index].viewContainerRef;

			//remove previous view
			viewContainerRef.clear();

			//create new view and set the data attribute
			let componentRef = viewContainerRef.createComponent(componentFactory);
			componentRef.instance.data = this.data[columnKey.key];
			componentRef.changeDetectorRef.detectChanges();

			index++;
		})
	}

}

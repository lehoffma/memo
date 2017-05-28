import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {ExpandableTableCellComponent} from "../../../shared/expandable-table/expandable-table-cell.component";
import {EntryCategory} from "../../../shared/model/entry-category";

@Component({
	selector: "td [costCategoryTableCell]",
	template: `
		<span class="data-as-icon" title="{{data}}">
			<md-icon>{{icon}}</md-icon>
		</span>
		<span class="data-as-text">
			{{data}}
		</span>
	`,
	styleUrls: ["../../administration/member-list/member-list-table-cells/icon-data-table-cell.component.scss"]
})
export class CostCategoryTableCellComponent implements OnInit, OnChanges, ExpandableTableCellComponent{
	@Input() data: EntryCategory;
	icon: string;

	constructor() {
	}

	ngOnInit() {
		this.icon = this.getIcon(this.data);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if(changes["data"]){
			this.icon = this.getIcon(this.data);
		}
	}

	getIcon(category: EntryCategory){
		switch(category){
			case EntryCategory.Food:
				return "restaurant";
			case EntryCategory.Fuel:
				return "local_gas_station";
			case EntryCategory.LeasingCar:
				return "drive_eta";
			case EntryCategory.Tickets:
				return "local_play";
			case EntryCategory.Tours:
				//todo wofür noch mal?
				return "tour";
		}
	}
}

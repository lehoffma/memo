import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {SortingOption} from "../model/sorting-option";
import {MultiLevelSelectParent} from "../utility/multi-level-select/shared/multi-level-select-parent";
import {Params} from "@angular/router";
import {Page} from "../model/api/page";

@Component({
	selector: "memo-results-container",
	templateUrl: "./results-container.component.html",
	styleUrls: ["./results-container.component.scss"]
})
export class ResultsContainerComponent implements OnInit {
	@Input() title: string;
	@Input() page: Page<any>;

	@Input() sortingOptions: SortingOption<any>[];
	@Input() defaultOption: SortingOption<any>;
	@Input() withoutUnsorted = false;

	@Input() filterOptions: MultiLevelSelectParent[];

	@Input() canAdd = false;

	@Output() onAdd: EventEmitter<any> = new EventEmitter();

	constructor() {
	}

	ngOnInit() {
	}

	add() {
		this.onAdd.emit(true);
	}

	updateQueryParams(newParams: Params) {

	}

	pageChange($event: number) {
		console.log($event);
	}
}

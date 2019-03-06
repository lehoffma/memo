import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {SortingOption} from "../model/sorting-option";
import {MultiLevelSelectParent} from "../utility/multi-level-select/shared/multi-level-select-parent";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {Page} from "../model/api/page";
import {first} from "rxjs/operators";
import {QueryParameterService} from "../services/query-parameter.service";

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

	@Output() pageChange: EventEmitter<number> = new EventEmitter();
	@Output() onAdd: EventEmitter<any> = new EventEmitter();

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router) {
	}

	ngOnInit() {
	}

	add() {
		this.onAdd.emit(true);
	}

	updateQueryParams(newParams: Params) {
		this.activatedRoute.queryParamMap.pipe(
			first()
		).subscribe(paramMap => {
			let params = QueryParameterService.updateQueryParams(paramMap, newParams);
			this.router.navigate([], {queryParams: params})
		})
	}
}

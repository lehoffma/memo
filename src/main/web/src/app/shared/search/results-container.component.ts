import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {SortingOption} from "../model/sorting-option";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {Page} from "../model/api/page";
import {first} from "rxjs/operators";
import {QueryParameterService} from "../services/query-parameter.service";
import {FilterOption} from "./filter-options/filter-option";

@Component({
	selector: "memo-results-container",
	templateUrl: "./results-container.component.html",
	styleUrls: ["./results-container.component.scss"]
})
export class ResultsContainerComponent implements OnInit {
	@Input() title: string;
	@Input() page: Page<any>;
	@Input() results: any[] | null;

	@Input() sortingOptions: SortingOption<any>[] = [];
	@Input() defaultOption: SortingOption<any>;
	@Input() withoutUnsorted = false;

	@Input() filterOptions: FilterOption[];

	@Input() displayHeader = true;

	@Input() canAdd = false;

	@Output() pageChange: EventEmitter<number> = new EventEmitter();
	@Output() onAdd: EventEmitter<any> = new EventEmitter();

	queryParams$ = this.activatedRoute.queryParams;

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router) {
	}

	ngOnInit() {
	}

	add() {
		this.onAdd.emit(true);
	}

	updateQueryParams(newParams: Params) {
		this.activatedRoute.queryParams.pipe(
			first()
		).subscribe(queryParams => {
			let params = QueryParameterService.updateQueryParams(queryParams, newParams);
			this.router.navigate([], {queryParams: params})
		})
	}
}

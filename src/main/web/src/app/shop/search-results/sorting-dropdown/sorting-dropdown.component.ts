import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {SortingOption, SortingOptionHelper} from "../../../shared/model/sorting-option";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {QueryParameterService} from "../../../shared/services/query-parameter.service";
import {ColumnSortingEvent} from "../../../shared/utility/expandable-table/column-sorting-event";
import {first, map, tap} from "rxjs/operators";
import {Sort} from "../../../shared/model/api/sort";

@Component({
	selector: "memo-sorting-dropdown",
	templateUrl: "./sorting-dropdown.component.html",
	styleUrls: ["./sorting-dropdown.component.scss"]
})
export class SortingDropdownComponent implements OnInit {

	noneSortingOption: SortingOption<any> = SortingOptionHelper.build(
		"Unsortiert",
		Sort.none()
	);

	@Input() sortingOptions: SortingOption<any>[];
	selectedOption: string = "";

	@Output() onSort: EventEmitter<ColumnSortingEvent<any>> = new EventEmitter();

	constructor(private router: Router,
				private activatedRoute: ActivatedRoute,
				private queryParameterService: QueryParameterService) {
	}

	get combinedOptions() {
		return [this.noneSortingOption, ...this.sortingOptions];
	}

	ngOnInit() {
		this.activatedRoute.queryParamMap
			.subscribe(queryParamMap => {
				this.selectedOption = "";
				const somethingMatched = this.sortingOptions.some(option => {
					const optionKeys = Object.keys(option.queryParameters);

					if (optionKeys.every(key => queryParamMap.has(key))
						&& optionKeys.every(key => queryParamMap.get(key) === option.queryParameters[key])) {
						this.selectedOption = option.name;
					}

					return this.selectedOption !== "";
				});
				if (!somethingMatched) {
					this.selectedOption = "Unsortiert";
				}
			})
	}

	updateQueryParams(queryParams: Params) {
		this.activatedRoute.queryParamMap
			.pipe(
				first(),
				map(paramMap => this.queryParameterService.updateQueryParams(paramMap, queryParams)),
				tap(() =>
					this.onSort.emit({
						key: queryParams["sortBy"],
						descending: queryParams["descending"] === "true"
					})
				)
			)
			.subscribe(newQueryParams => this.router.navigate([], {queryParams: newQueryParams}));
	}
}

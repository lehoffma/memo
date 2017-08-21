import {Component, Input, OnInit} from "@angular/core";
import {SortingOption} from "../../../shared/model/sorting-option";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {QueryParameterService} from "../../../shared/services/query-parameter.service";

@Component({
	selector: "memo-sorting-dropdown",
	templateUrl: "./sorting-dropdown.component.html",
	styleUrls: ["./sorting-dropdown.component.scss"]
})
export class SortingDropdownComponent implements OnInit {
	//TODO: update text if sort selection changes. or at least highlight which one is selected at the moment?
	@Input() sortingOptions: SortingOption<any>[];
	selectedOption: string = "";

	constructor(private router: Router,
				private activatedRoute: ActivatedRoute,
				private queryParameterService: QueryParameterService) {
	}

	ngOnInit() {
		this.activatedRoute.queryParamMap
			.subscribe(queryParamMap => {
				this.selectedOption = "";
				this.sortingOptions.some(option => {
					const optionKeys = Object.keys(option.queryParameters);

					if (optionKeys.every(key => queryParamMap.has(key))
						&& optionKeys.every(key => queryParamMap.get(key) === option.queryParameters[key])) {
						this.selectedOption = option.name;
					}

					return this.selectedOption !== "";
				});
			})
	}

	updateQueryParams(queryParams: Params) {
		this.activatedRoute.queryParamMap.first()
			.map(paramMap => this.queryParameterService.updateQueryParams(paramMap, queryParams))
			.subscribe(newQueryParams => this.router.navigate(["search"], {queryParams: newQueryParams}));
	}
}

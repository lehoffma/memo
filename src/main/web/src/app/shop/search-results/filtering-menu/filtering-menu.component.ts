import {Component, Input, OnInit} from "@angular/core";
import {isMultiLevelSelectLeaf} from "../../../shared/multi-level-select/shared/multi-level-select-option";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {QueryParameterService} from "../../../shared/services/query-parameter.service";
import {MultiLevelSelectParent} from "../../../shared/multi-level-select/shared/multi-level-select-parent";
import {MultiLevelSelectLeaf} from "../../../shared/multi-level-select/shared/multi-level-select-leaf";

@Component({
	selector: "memo-filtering-menu",
	templateUrl: "./filtering-menu.component.html",
	styleUrls: ["./filtering-menu.component.scss"]
})
export class FilteringMenuComponent implements OnInit {
	@Input() filterOptions: MultiLevelSelectParent[];

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private queryParameterService: QueryParameterService) {
	}

	ngOnInit() {
	}

	updateQueryParams(option: MultiLevelSelectParent) {
		let queryParams: Params = {};
		queryParams[option.queryKey] = option.children
			.filter(child => {
				if (isMultiLevelSelectLeaf(child)) {
					return child.selected
				}
				return false;
			})
			.map(child => (<MultiLevelSelectLeaf>child))
			.map(child => child.queryValue)
			.join("|");

		this.activatedRoute.queryParamMap.first()
			.map(paramMap => this.queryParameterService.updateQueryParams(paramMap, queryParams))
			.subscribe(newQueryParams => this.router.navigate(["search"], {queryParams: newQueryParams}));
	}
}

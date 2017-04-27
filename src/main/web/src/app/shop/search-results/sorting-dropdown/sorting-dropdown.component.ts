import {Component, Input, OnInit} from "@angular/core";
import {SortingOption} from "../../../shared/model/sorting-option";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";

@Component({
	selector: "memo-sorting-dropdown",
	templateUrl: "./sorting-dropdown.component.html",
	styleUrls: ["./sorting-dropdown.component.scss"]
})
export class SortingDropdownComponent implements OnInit {
	//TODO: update text if sort selection changes. or at least highlight which one is selected at the moment?
	@Input() sortingOptions: SortingOption<any>[];

	constructor(private router: Router,
				private activatedRoute: ActivatedRoute) {
	}

	ngOnInit() {
	}

	updateQueryParams(queryParams) {
		this.activatedRoute.queryParamMap.first()
			.subscribe((paramMap: ParamMap) => {
				const oldParamKeys = paramMap.keys
					.filter(key => !Object.keys(queryParams).includes(key));

				let newQueryParams = {};

				oldParamKeys.forEach(key => newQueryParams[key] = paramMap.get(key));
				Object.keys(queryParams).forEach(key => newQueryParams[key] = queryParams[key]);

				this.router.navigate(["search"], {queryParams: newQueryParams});
			});
	}
}

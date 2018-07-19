import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {isMultiLevelSelectLeaf} from "../../../shared/utility/multi-level-select/shared/multi-level-select-option";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {QueryParameterService} from "../../../shared/services/query-parameter.service";
import {MultiLevelSelectParent} from "../../../shared/utility/multi-level-select/shared/multi-level-select-parent";
import {MultiLevelSelectLeaf} from "../../../shared/utility/multi-level-select/shared/multi-level-select-leaf";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {first, map} from "rxjs/operators";

@Component({
	selector: "memo-filtering-menu",
	templateUrl: "./filtering-menu.component.html",
	styleUrls: ["./filtering-menu.component.scss"],
	animations: [
		trigger("slideUp", [
			state("1", style({transform: "translateX(0)"})),
			transition(":enter", [
				style({transform: "translateX(-100%)"}),
				animate("200ms ease-in"),
			]),
			transition(":leave", [
				animate("200ms ease-in", style({transform: "translateX(-100%)"}))
			])
		])
	]
})
export class FilteringMenuComponent implements OnInit, OnChanges {
	@Input() filterOptions: MultiLevelSelectParent[];

	selectedOption = {};

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private queryParameterService: QueryParameterService) {
	}

	ngOnInit() {
	}

	/**
	 * Initialize the selectedOption object whenever the input changes
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges(changes: SimpleChanges): void {
		if (changes["filterOptions"] && this.filterOptions) {
			this.filterOptions
				.filter(option => option.selectType === "single")
				.forEach(option => {
					this.selectedOption[option.name] = option.children.find(child => child["selected"]);

				})
		}
	}

	/**
	 *
	 * @param {string} queryKey
	 */
	updateFromRadioSelection(queryKey: string) {
		const parent = this.filterOptions.find(option => option.name === queryKey);
		const childIndex = parent.children.findIndex(child => this.selectedOption[queryKey].name === child.name);

		parent.children.forEach(child => isMultiLevelSelectLeaf(child) ? child.selected = false : null);
		parent.children[childIndex]["selected"] = true;
		this.updateQueryParams(parent);
	}

	/**
	 *
	 * @param {MultiLevelSelectParent} option
	 */
	updateQueryParams(option: MultiLevelSelectParent) {
		const children = option.children
			.filter(child => {
				if (isMultiLevelSelectLeaf(child)) {
					return child.selected
				}
				return false;
			})
			.map(child => (<MultiLevelSelectLeaf>child));

		let queryParams: Params = children
			.reduce((params: Params, child) => {
				return child.query.reduce((acc, query) => {
					let previousValue = (acc[query.key] && acc[query.key].split("|")) || [];
					acc[query.key] = [...previousValue, ...query.values].join("|");
					return acc;
				}, params);
			}, {});

		option.children
			.map(child => (<MultiLevelSelectLeaf>child))
			.forEach(child => {
				child.query.forEach(query => {
					if (!queryParams[query.key]) {
						queryParams[query.key] = "";
					}
				})
			});

		this.activatedRoute.queryParamMap
			.pipe(
				first(),
				map(paramMap => this.queryParameterService.updateQueryParams(paramMap, queryParams))
			)
			.subscribe(newQueryParams => this.router.navigate([], {queryParams: newQueryParams}));
	}
}

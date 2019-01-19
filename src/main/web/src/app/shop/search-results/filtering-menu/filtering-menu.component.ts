import {ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from "@angular/core";
import {isMultiLevelSelectLeaf, MultiLevelSelectOption} from "../../../shared/utility/multi-level-select/shared/multi-level-select-option";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {QueryParameterService} from "../../../shared/services/query-parameter.service";
import {MultiLevelSelectParent} from "../../../shared/utility/multi-level-select/shared/multi-level-select-parent";
import {MultiLevelSelectLeaf} from "../../../shared/utility/multi-level-select/shared/multi-level-select-leaf";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {first, map, takeUntil} from "rxjs/operators";
import {AbstractControl, FormBuilder} from "@angular/forms";
import {combineLatest, Subject} from "rxjs";

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
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilteringMenuComponent implements OnInit, OnDestroy, OnChanges {
	@Input() filterOptions: MultiLevelSelectParent[];

	filterOptionMap: { [option: string]: MultiLevelSelectParent | MultiLevelSelectOption };
	singleSelectionForm = this.formBuilder.group({});
	multiSelectionForm = this.formBuilder.group({});
	selectedOption = {};

	onDestroy$ = new Subject<any>();

	constructor(private activatedRoute: ActivatedRoute,
				private formBuilder: FormBuilder,
				private router: Router) {
	}

	ngOnInit() {
		if (this.filterOptions) {
			this.filterOptionMap = this.filterOptions
				.reduce((acc, option) => {
					acc[option.name] = option;
					return acc;
				}, {});
		}

		combineLatest(
			this.singleSelectionForm.valueChanges,
			this.multiSelectionForm.valueChanges
		).pipe(takeUntil(this.onDestroy$)).subscribe(([singleSelection, multiSelection]) => {
			this.updateParams(singleSelection, multiSelection);
		});
	}

	ngOnDestroy(): void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

	/**
	 * Initialize the selectedOption object whenever the input changes
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges(changes: SimpleChanges): void {
		if (changes["filterOptions"] && this.filterOptions) {
			this.filterOptionMap = this.filterOptions
				.reduce((acc, option) => {
					acc[option.name] = option;
					return acc;
				}, {});

			this.filterOptions
				.forEach(option => {
					if (option.selectType === "single") {
						const selectedChild = option.children.find(child => child["selected"])
							.name;
						if (!this.singleSelectionForm.contains(option.name)) {
							this.singleSelectionForm.addControl(option.name, this.formBuilder.control(
								selectedChild
							));
						} else {
							this.singleSelectionForm.get(option.name).setValue(selectedChild);
						}
					} else {
						const value = option.children
							.reduce((acc, child) => {
								acc[child.name] = child["selected"];
								return acc;
							}, {});
						if (!this.multiSelectionForm.contains(option.name)) {
							this.multiSelectionForm.addControl(option.name, this.formBuilder.group(
								value
							));
						} else {
							this.multiSelectionForm.get(option.name).setValue(value);
						}
					}
				})
		}
	}

	private updateParams(singleSelection: { [key: string]: string }, multiSelection: { [key: string]: { [key: string]: boolean } }) {
		this.updateQueryParameters(
			this.getSingleSelectionParams(singleSelection),
			this.getMultiSelectionParams(multiSelection)
		)
	}

	private getChildParams(children: MultiLevelSelectLeaf[]) {
		return children.reduce((params: Params, child: MultiLevelSelectLeaf) => {
			return child.query.reduce((acc, query) => {
				let previousValue = (acc[query.key] && acc[query.key].split(",")) || [];
				acc[query.key] = [...previousValue, ...query.values].join(",");
				return acc;
			}, params);
		}, {});
	}

	/**
	 *
	 * @param selection
	 */
	getSingleSelectionParams(selection: { [key: string]: string }): Params {
		return Object.keys(selection)
			.reduce((acc, parentKey) => {
				const parent = (this.filterOptionMap[parentKey] as MultiLevelSelectParent);

				if (!parent) {
					return acc;
				}

				(parent.children as MultiLevelSelectLeaf[]).forEach(child => {
					child.query.forEach(query => {
						acc[query.key] = "";
					})
				});

				const childParams = this.getChildParams((parent.children as MultiLevelSelectLeaf[])
					.filter(child => selection[parentKey] === child.name)
				);

				return {...acc, ...childParams};
			}, {});
	}

	/**
	 *
	 * @param selection
	 */
	getMultiSelectionParams(selection: { [key: string]: { [key: string]: boolean } }): Params {
		return Object.keys(selection)
			.reduce((acc, parentKey) => {
				const parent = (this.filterOptionMap[parentKey] as MultiLevelSelectParent);

				if (!parent) {
					return acc;
				}

				(parent.children as MultiLevelSelectLeaf[]).forEach(child => {
					child.query.forEach(query => {
						acc[query.key] = "";
					})
				});

				const childParams = this.getChildParams((parent.children as MultiLevelSelectLeaf[])
					.filter(child => selection[parentKey][child.name])
				);

				return {...acc, ...childParams};
			}, {});
	}

	/**
	 *
	 * @param singleSelection
	 * @param multiSelection
	 */
	updateQueryParameters(singleSelection: Params, multiSelection: Params) {
		const combined = {...singleSelection, ...multiSelection};

		this.activatedRoute.queryParamMap
			.pipe(
				first(),
				map(paramMap => QueryParameterService.updateQueryParams(paramMap, combined))
			)
			.subscribe(newQueryParams => this.router.navigate([], {queryParams: newQueryParams}));
	}

	/**
	 *
	 * @param control
	 * @param method
	 */
	selectOption(control: AbstractControl, method: any) {
		const value = control.value;
		control.setValue(Object.keys(value).reduce((acc, key) => {
			acc[key] = key === method;
			return acc
		}, {}));
	}

	withReset(option: MultiLevelSelectParent) {
		if (option.selectType === "multiple") {
			return this.multiSelectionHasFilterApplied(this.multiSelectionForm.get(option.name))
		} else {
			//there is a reset option
			if (option.children.some(child => child.name === "Alle")) {
				return this.singleSelectionForm.get(option.name).value !== "Alle";
			}
		}
	}

	multiSelectionHasFilterApplied(control: AbstractControl) {
		const value = control.value;
		return Object.keys(value).some(key => value[key]);
	}

	reset(option: MultiLevelSelectParent) {
		if (option.selectType === "multiple") {
			let control = this.multiSelectionForm.get(option.name);
			this.resetMultiSelection(control);
		} else {
			let control = this.singleSelectionForm.get(option.name);
			this.resetSingleSelection(control);
		}
	}

	resetSingleSelection(control: AbstractControl) {
		control.setValue("Alle");
	}

	resetMultiSelection(control: AbstractControl) {
		const value = control.value;
		control.setValue(Object.keys(value).reduce((acc, key) => {
			acc[key] = false;
			return acc
		}, {}));
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
					let previousValue = (acc[query.key] && acc[query.key].split(",")) || [];
					acc[query.key] = [...previousValue, ...query.values].join(",");
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
				map(paramMap => QueryParameterService.updateQueryParams(paramMap, queryParams))
			)
			.subscribe(newQueryParams => this.router.navigate([], {queryParams: newQueryParams}));
	}

}

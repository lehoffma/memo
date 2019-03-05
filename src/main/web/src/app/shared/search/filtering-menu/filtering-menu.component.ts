import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from "@angular/core";
import {isMultiLevelSelectLeaf, MultiLevelSelectOption} from "../../utility/multi-level-select/shared/multi-level-select-option";
import {ActivatedRoute, Params} from "@angular/router";
import {MultiLevelSelectParent} from "../../utility/multi-level-select/shared/multi-level-select-parent";
import {MultiLevelSelectLeaf} from "../../utility/multi-level-select/shared/multi-level-select-leaf";
import {filter, takeUntil} from "rxjs/operators";
import {FormBuilder} from "@angular/forms";
import {combineLatest, Subject} from "rxjs";
import {MatDialog} from "@angular/material";
import {FilterDialogComponent} from "./filter-sidebar/filter-dialog.component";

@Component({
	selector: "memo-filtering-menu",
	templateUrl: "./filtering-menu.component.html",
	styleUrls: ["./filtering-menu.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilteringMenuComponent implements OnInit, OnDestroy, OnChanges {
	@Input() filterOptions: MultiLevelSelectParent[];
	@Output() queryParamChange = new EventEmitter<Params>();

	filterOptionMap: { [option: string]: MultiLevelSelectParent | MultiLevelSelectOption };
	singleSelectionForm = this.formBuilder.group({});
	multiSelectionForm = this.formBuilder.group({});
	selectedOption = {};

	onDestroy$ = new Subject<any>();

	pauseFormUpdates = false;

	open = false;

	constructor(private activatedRoute: ActivatedRoute,
				private matDialog: MatDialog,
				private formBuilder: FormBuilder) {
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
		).pipe(
			filter(it => !this.pauseFormUpdates),
			takeUntil(this.onDestroy$)
		)
			.subscribe(([singleSelection, multiSelection]) => {
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

			this.pauseFormUpdates = true;
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
							this.singleSelectionForm.get(option.name).setValue(selectedChild, {emitEvent: false});
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
							this.multiSelectionForm.get(option.name).setValue(value, {emitEvent: false});
						}
					}
				});

			this.pauseFormUpdates = false;
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

		this.queryParamChange.emit(combined);
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

		this.queryParamChange.emit(queryParams);
	}

	startFiltering() {
		this.open = true;
		this.matDialog.open(FilterDialogComponent, {
			width: "100vw",
			height: "100%",
			maxHeight: "100vh",
			maxWidth: "none",
			id: "filter-dialog",
			autoFocus: false,
			data: {
				filterOptions: this.filterOptions,
				singleSelectionForm: this.singleSelectionForm,
				multiSelectionForm: this.multiSelectionForm,
			}
		});
		//stop automatic url updating
	}

	cancel() {
		this.open = false;
		//reset form group to previous value
	}

	apply() {
		this.open = false;
		//update url manually
	}
}

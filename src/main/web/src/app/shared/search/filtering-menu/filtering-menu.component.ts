import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from "@angular/core";
import {ActivatedRoute, Params} from "@angular/router";
import {filter, takeUntil} from "rxjs/operators";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Observable, Subject} from "rxjs";
import {MatDialog} from "@angular/material";
import {FilterDialogComponent} from "./filter-sidebar/filter-dialog.component";
import {FilterOption} from "../filter-options/filter-option";
import {ShopItem} from "../../model/shop-item";

export interface FilterFormValue {
	single: { [key: string]: string },
	multiple: { [keyA: string]: { [key: string]: boolean } },
	"date-range": { [key: string]: { from: Date, to: Date } },
	"shop-item": { [key: string]: ShopItem[] }
}

@Component({
	selector: "memo-filtering-menu",
	templateUrl: "./filtering-menu.component.html",
	styleUrls: ["./filtering-menu.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilteringMenuComponent implements OnInit, OnDestroy, OnChanges {
	@Input() filterOptions: FilterOption[];
	@Input() queryParams: Params = {};
	@Output() queryParamChange = new EventEmitter<Params>();

	//"single" | "multiple" | "date-range" | "shop-item"
	formGroup: FormGroup = this.formBuilder.group({
		"single": this.formBuilder.group({}),
		"multiple": this.formBuilder.group({}),
		"date-range": this.formBuilder.group({}),
		"shop-item": this.formBuilder.group([])
	});


	onDestroy$ = new Subject<any>();

	pauseFormUpdates = false;
	open = false;

	constructor(private activatedRoute: ActivatedRoute,
				private matDialog: MatDialog,
				private formBuilder: FormBuilder) {
	}

	ngOnInit() {
		this.formGroup.valueChanges.pipe(
			filter(it => !this.pauseFormUpdates),
			takeUntil(this.onDestroy$)
		)
			.subscribe((value: FilterFormValue) => {
				this.queryParamChange.emit(this.getParams(value));
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
		if ((changes["filterOptions"] || changes["queryParams"]) && this.filterOptions) {
			this.pauseFormUpdates = true;
			this.filterOptions
				.forEach(option => {
					let value = option.toFormValue(this.queryParams);
					const childFormGroup: FormGroup = (this.formGroup.get(option.type) as FormGroup);
					if (childFormGroup.contains(option.key)) {
						childFormGroup.get(option.key).setValue(value, {emitEvent: false});
					} else {
						switch (option.type) {
							case "single":
								childFormGroup.addControl(option.key, this.formBuilder.control(value));
								break;
							case "multiple":
								childFormGroup.addControl(option.key, this.formBuilder.group(
									Object.keys(value).reduce((acc, key) => {
										acc[key] = this.formBuilder.control(value[key]);
										return acc;
									}, {})
								));
								break;
							case "date-range":
								childFormGroup.addControl(option.key, this.formBuilder.group({
									from: this.formBuilder.control((value as any).from),
									to: this.formBuilder.control((value as any).to)
								}));
								break;
							case "shop-item":
								value = value as Observable<{items: ShopItem[], input: string}>;
								value.subscribe(it => {
									childFormGroup.addControl(option.key, this.formBuilder.group({
										items: this.formBuilder.control(it.items),
										input: this.formBuilder.control(it.input)
									}));
								})
								break;
						}
					}
				});

			this.formGroup.updateValueAndValidity();
			this.pauseFormUpdates = false;
		}
	}

	private getParams(value: FilterFormValue): Params {
		return this.filterOptions.reduce((params, option) => {
			return {
				...params,
				...this.getOptionParams(value, option)
			};
		}, {});
	}

	private getOptionParams(value: FilterFormValue, option: FilterOption): Params {
		switch (option.type) {
			case "single":
				return option.toQueryParams(value.single[option.key]);
			case "multiple":
				return option.toQueryParams(
					Object.keys(value.multiple[option.key])
						.filter(key => value.multiple[option.key][key])
				);
			case "date-range":
				return option.toQueryParams({
					from: value["date-range"][option.key].from,
					to: value["date-range"][option.key].to
				});
			case "shop-item":
				return option.toQueryParams(value["shop-item"][option.key]["items"]);
		}
		return {};
	}


	startFiltering() {
		this.open = true;
		const dialogRef = this.matDialog.open(FilterDialogComponent, {
			width: "100vw",
			height: "100%",
			maxHeight: "100vh",
			maxWidth: "none",
			id: "filter-dialog",
			autoFocus: false,
			data: {
				filterOptions: this.filterOptions,
				value: this.formGroup.value,
			}
		});
		dialogRef.afterClosed().subscribe(value => {
			if (value) {
				this.queryParamChange.emit(this.getParams(value))
			}
		})
	}
}

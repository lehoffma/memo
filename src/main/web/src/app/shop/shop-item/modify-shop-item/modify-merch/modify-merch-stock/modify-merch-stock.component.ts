import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {MerchStock} from "../../../../shared/model/merch-stock";
import {ModifyMerchStockService} from "./modify-merch-stock.service";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {filter, map, take} from "rxjs/operators";
import {timer} from "rxjs";
import {InMemoryDataService} from "../../../../../shared/utility/material-table/in-memory-data.service";
import {TableColumn} from "../../../../../shared/utility/material-table/expandable-material-table.component";

@Component({
	selector: "memo-modify-merch-stock",
	templateUrl: "./modify-merch-stock.component.html",
	styleUrls: ["./modify-merch-stock.component.scss"],
	providers: [ModifyMerchStockService, InMemoryDataService, {
		provide: NG_VALUE_ACCESSOR,
		useExisting: ModifyMerchStockComponent,
		multi: true
	}],
})
export class ModifyMerchStockComponent implements OnInit, OnDestroy, ControlValueAccessor {
	@Input() formControl: FormControl;
	@Input() merchTitle: string;
	_onChange;
	subscription;
	/*
			new ExpandableTableColumn<MerchStock>("Größe", "size"),
			new ExpandableTableColumn<MerchStock>("Farbe", "color", MerchColorCellComponent),
			new ExpandableTableColumn<MerchStock>("Anzahl", "amount")
	 */
	columns: TableColumn<MerchStock>[] = [
		{columnDef: "size", header: "Größe", cell: element => element.size},
		{columnDef: "color", header: "Farbe", cell: element => element.color, type: "color"},
		{columnDef: "amount", header: "Anzahl", cell: element => element.amount}
	];
	displayedColumns = this.columns.map(it => it.columnDef);

	constructor(public modifyMerchStockService: ModifyMerchStockService,
				public dataService: InMemoryDataService<MerchStock>) {
	}

	_previousValue: MerchStock[];

	get previousValue() {
		return this._previousValue;
	}

	@Input() set previousValue(previousValue: MerchStock[]) {
		if (previousValue === undefined) {
			return;
		}
		this._previousValue = previousValue;
		this.dataService.init(previousValue);
	}

	ngOnInit() {
		this.modifyMerchStockService.dataSource = this.dataService;
		this.subscription = this.dataService.data$.subscribe(value => this.onChange(value));
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}


	onChange(merchStock: MerchStock[]) {
		timer(0, 500)
			.pipe(
				//hack: sometimes _onChange is not yet initialized when we're attempting to set the value
				filter(it => this._onChange !== null),
				take(1),
				map(it => merchStock)
			)
			.subscribe(values => {
				this._onChange(values);
			});
	}

	registerOnChange(fn: any): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: any): void {
	}

	setDisabledState(isDisabled: boolean): void {
		if (isDisabled) {
			this.formControl.disable();
		}
		else {
			this.formControl.enable();
		}
	}

	writeValue(obj: MerchStock[]): void {
		this.formControl.setValue(obj);
	}

}

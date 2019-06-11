import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MerchStock} from "../../../../shared/model/merch-stock";
import {MerchColor} from "../../../../shared/model/merch-color";
import {Event} from "../../../../shared/model/event";
import {stockAmountToStatus, StockStatus} from "../../../../../club-management/stock/merch-stock/merch-stock-entry/stock-entry";
import {MatDialog} from "@angular/material";
import {AddColorDialogComponent, AddColorDialogOptions} from "./add-color-dialog.component";

@Component({
	selector: "memo-modify-merch-stock2",
	templateUrl: "./modify-merch-stock2.component.html",
	styleUrls: ["./modify-merch-stock2.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifyMerchStock2Component implements OnInit {
	@Input() formGroup: FormGroup;
	@Input() merchTitle: string;
	@Input() item: Event;

	Status = StockStatus;

	constructor(private fb: FormBuilder,
				private matDialog: MatDialog,
				private cdRef: ChangeDetectorRef) {
	}

	_previousValue: MerchStock[];
	displayedColumns: string[] = ["size", "amount", "status", "actions"];

	colors: { [colorId: number]: MerchColor } = {};
	controls: { [colorId: number]: AbstractControl } = {};

	getStatus(amount: number): StockStatus {
		return stockAmountToStatus(amount);
	}

	trackById(input: MerchStock) {
		return input.id;
	}

	trackByIdentity(input: any) {
		return input;
	}

	get previousValue() {
		return this._previousValue;
	}

	@Input() set previousValue(previousValue: MerchStock[]) {
		if (previousValue === undefined) {
			return;
		}
		this._previousValue = previousValue;
		this.initializeFormGroup(previousValue);
		this.colors = this.getColors();
		this.controls = this.formGroup.controls;
		this.cdRef.detectChanges();
	}

	ngOnInit() {
		this.colors = this.getColors();
	}

	getColorId(color: MerchColor): string {
		return color.id + "-" + color.name + "-" + color.hex;
	}

	private initializeFormGroup(stock: MerchStock[]) {
		const groupedMap = this.groupByColor(stock);
		const colors: MerchColor[] = Array.from(groupedMap.keys());

		const group = this.formGroup;
		const currentControls = Object.keys(group.controls);

		//removed controls
		currentControls
			.filter(it => !colors.find(color => (this.getColorId(color)) === it))
			.forEach(group.removeControl);

		//todo amount minimum(0) validator
		//newly added or edited colors
		colors
			.forEach(color => {
				const id = this.getColorId(color);
				if (!currentControls.includes(id)) {
					group.addControl(id, this.fb.array([]));
				}

				const innerArray = group.get(id) as FormArray;
				innerArray.clear();
				groupedMap.get(color).forEach(stockEntry => {
					innerArray.push(this.fb.group(stockEntry))
				});
			});
	}

	getColors(): { [colorId: number]: MerchColor } {
		return Object.keys(this.formGroup.controls)
			.reduce((acc, colorId) => {
				acc[colorId] = this.formGroup.get(colorId).value[0].color;
				return acc;
			}, {});
	}

	groupByColor(value: MerchStock[]): Map<MerchColor, MerchStock[]> {
		if (!value) {
			return new Map();
		}

		return value.reduce((map, val) => {
			if (!map.has(val.color)) {
				map.set(val.color, []);
			}
			map.set(val.color, [...map.get(val.color), val]);

			return map;
		}, new Map<MerchColor, MerchStock[]>());
	}

	addColor(color: MerchColor) {
		const id = this.getColorId(color);
		this.formGroup.addControl(id, this.fb.array([]));
		this.addSize(id);
		this.colors[id] = color;
		this.controls = {...this.formGroup.controls};
		this.cdRef.detectChanges();
	}

	removeColor(colorId: number) {
		//todo with confirmation dialog
		this.formGroup.removeControl(colorId + "");
		this.colors[colorId] = undefined;
		this.colors = {...this.colors};
		this.controls = {...this.formGroup.controls};
	}

	addSize(colorId: string) {
		//todo validator: size name darf nicht doppelt vorkommen
		(this.formGroup.get(colorId) as FormArray).push(this.fb.group({
			id: -1,
			size: "",
			item: this.item,
			color: this.colors[colorId],
			amount: 0
		}));
	}

	get(colorId: string, index: number): MerchStock {
		return this.previousValue.filter(it => (this.getColorId(it.color)) === colorId)[index];
	}

	hasChanges(colorId: string, index: number) {
		const previous = this.get(colorId, index);
		const current = (this.formGroup.get(colorId) as FormArray).at(index).value;

		return previous.amount !== current.amount || previous.size !== current.size
	}

	revertChanges(colorId: string, index: number) {
		const previous = this.get(colorId, index);
		(this.formGroup.get(colorId) as FormArray).at(index).setValue(previous)
	}

	removeSize(colorId: string, index: number) {
		(this.formGroup.get(colorId) as FormArray).removeAt(index);
	}

	sum(stock: MerchStock[]): number {
		return stock.reduce((sum, val) => sum + val.amount, 0);
	}

	objectKeys(any: any): string[] {
		return Object.keys(any);
	}

	openAddColorDialog(previousValue?: MerchColor) {
		const formGroup = this.fb.group({
			name: this.fb.control(previousValue ? previousValue.name : "", {validators: [Validators.required]}),
			hex: this.fb.control(previousValue ? previousValue.hex : "#ff0000", {validators: [Validators.required]}),
		});

		const dialogRef = this.matDialog.open(AddColorDialogComponent, {
			data: {
				previousValue,
				formGroup
			} as AddColorDialogOptions
		});

		dialogRef.afterClosed()
			.subscribe(result => {
				if (!result) {
					return;
				}

				this.addColor({
					id: -1,
					name: formGroup.value.name,
					hex: formGroup.value.hex
				});
			})
	}
}

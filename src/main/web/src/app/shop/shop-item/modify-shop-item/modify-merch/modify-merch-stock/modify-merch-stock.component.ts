import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MerchStock} from "../../../../shared/model/merch-stock";
import {MerchColor} from "../../../../shared/model/merch-color";
import {Event} from "../../../../shared/model/event";
import {stockAmountToStatus, StockStatus} from "../../../../../club-management/stock/merch-stock/merch-stock-entry/stock-entry";
import {MatDialog} from "@angular/material";
import {AddColorDialogComponent, AddColorDialogOptions} from "./add-color-dialog.component";
import {noDuplicateColorValidator, noDuplicateSizesValidator} from "./validators/no-duplicate.validator";
import {EventUtilityService} from "../../../../../shared/services/event-utility.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
	selector: "memo-modify-merch-stock",
	templateUrl: "./modify-merch-stock.component.html",
	styleUrls: ["./modify-merch-stock.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifyMerchStockComponent implements OnInit {
	@Input() formGroup: FormGroup = this.fb.group({});
	@Input() merchTitle: string;
	@Input() item: Event;

	@Input() editing = true;
	@Input() inline = false;

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
		this.colors = {...this.getColors()};
		this.controls = {...this.formGroup.controls};
		this.cdRef.detectChanges();
	}

	ngOnInit() {
		this.colors = this.getColors();
	}

	getColorId(color: MerchColor): string {
		return JSON.stringify(color);
	}

	private initializeFormGroup(stock: MerchStock[]) {
		const groupedMap = this.groupByColor(stock);
		const colorIds: string[] = Array.from(groupedMap.keys());

		const group = this.formGroup;
		const currentControls = Object.keys(group.controls);

		//removed controls
		currentControls
			.filter(it => !colorIds.find(colorId => colorId === it))
			.forEach(group.removeControl);

		//newly added or edited colors
		colorIds
			.forEach(id => {
				if (!currentControls.includes(id)) {
					group.addControl(id,
						this.fb.array(
							[],
							{validators: [Validators.required, noDuplicateSizesValidator()]}
						)
					);
				}

				const innerArray = group.get(id) as FormArray;
				innerArray.clear();
				groupedMap.get(id).forEach(stockEntry => {
					innerArray.push(this.getFormGroupFromStock(stockEntry))
				});
			});
	}

	private getFormGroupFromStock(stockEntry: MerchStock): FormGroup {
		const formGroup = this.fb.group({
			size: this.fb.control(stockEntry.size, {validators: [Validators.required]}),
			amount: this.fb.control(stockEntry.amount, {validators: [Validators.required, Validators.min(0)]}),
			id: this.fb.control(stockEntry.id),
			color: this.fb.control(stockEntry.color),
			item: this.fb.control(stockEntry.item)
		});

		// formGroup.get("id").disable();
		// formGroup.get("color").disable();
		formGroup.get("item").disable();

		return formGroup;
	}


	getColors(): { [colorId: number]: MerchColor } {
		return Object.keys(this.formGroup.controls)
			.reduce((acc, colorId) => {
				acc[colorId] = this.formGroup.get(colorId).value[0].color;
				return acc;
			}, {});
	}

	groupByColor(value: MerchStock[]): Map<string, MerchStock[]> {
		if (!value) {
			return new Map();
		}

		return value.reduce((map, val) => {
			const id = this.getColorId(val.color);
			if (!map.has(id)) {
				map.set(id, []);
			}
			map.set(id, [...map.get(id), val]);

			return map;
		}, new Map<string, MerchStock[]>());
	}

	addColor(color: MerchColor) {
		const id = this.getColorId(color);
		this.formGroup.addControl(id, this.fb.array([], {validators: [noDuplicateSizesValidator]}));
		this.addSize(id);
		this.colors[id] = color;
		this.controls = {...this.formGroup.controls};
		this.cdRef.detectChanges();
	}

	editColor(previous: MerchColor, newColor: MerchColor) {
		const oldId = this.getColorId(previous);
		const newId = this.getColorId(newColor);

		const value: MerchStock[] = this.formGroup.get(oldId).value;

		this.formGroup.removeControl(oldId);

		this.formGroup.addControl(newId, this.fb.array([], {validators: [noDuplicateSizesValidator]}));
		const formArray = (this.formGroup.get(newId) as FormArray);
		value.forEach(val => formArray.push(this.getFormGroupFromStock(val)));

		this.colors[oldId] = undefined;
		this.colors[newId] = newColor;
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
		const dummy: MerchStock = {
			id: -1,
			size: "",
			item: this.item,
			color: this.colors[colorId],
			amount: 0
		};

		(this.formGroup.get(colorId) as FormArray).push(this.getFormGroupFromStock(dummy));
	}

	get(colorId: string, index: number): MerchStock {
		return this.previousValue.filter(it => (this.getColorId(it.color)) === colorId)[index];
	}

	hasChanges(colorId: string, index: number) {
		const previous = this.get(colorId, index);
		const current = (this.formGroup.get(colorId) as FormArray).at(index).value;

		//color has been changed
		if (!previous) {
			return false;
		}

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
		console.log(any);
		return Object.keys(any);
	}

	openAddColorDialog(previousValue?: MerchColor) {
		const colors = Object.keys(this.colors).map(key => this.colors[key]);
		const formGroup = this.fb.group({
			name: this.fb.control(previousValue ? previousValue.name : "", {validators: [Validators.required]}),
			hex: this.fb.control(previousValue ? previousValue.hex : "#ff0000", {validators: [Validators.required]}),
		},);

		const closed$ = new Subject();

		const dialogRef = this.matDialog.open(AddColorDialogComponent, {
			data: {
				previousValue,
				formGroup
			} as AddColorDialogOptions
		});


		const nameControl = formGroup.get("name");

		//it wouldn't work with a normal validator assignment. no idea why
		formGroup.valueChanges.pipe(takeUntil(closed$))
			.subscribe(value => {
				const errors = noDuplicateColorValidator(colors)(formGroup);
				nameControl.setErrors(errors, {emitEvent: false});
			});

		dialogRef.afterClosed()
			.subscribe(result => {
				closed$.next(true);
				if (!result) {
					return;
				}

				const newColor = {
					id: -1,
					name: formGroup.value.name,
					hex: formGroup.value.hex
				};

				if (previousValue) {
					this.editColor(previousValue, {...newColor, id: previousValue.id})
				} else {
					this.addColor(newColor);
				}
			})
	}

	openEditColorDialog(color: MerchColor) {
		this.openAddColorDialog(color);
	}

	getItemLink(): string {
		return "/shop/" + EventUtilityService.getEventType(this.item) + "/" + this.item.id;
	}
}

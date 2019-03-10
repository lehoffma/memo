import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, FormGroup} from "@angular/forms";
import {FilterFormValue} from "../filtering-menu.component";
import {FilterOption} from "../../filter-options/filter-option";

@Component({
	selector: "memo-filter-dialog",
	templateUrl: "./filter-dialog.component.html",
	styleUrls: ["./filter-dialog.component.scss"]
})
export class FilterDialogComponent implements OnInit {

	public formGroup = this.fb.group({
		"single": this.fb.group({}),
		"multiple": this.fb.group({}),
		"date-range": this.fb.group({}),
		"shop-item": this.fb.group([])
	});

	constructor(public dialogRef: MatDialogRef<FilterDialogComponent>,
				private fb: FormBuilder,
				@Inject(MAT_DIALOG_DATA) public data: {
					filterOptions: FilterOption[],
					value: FilterFormValue
				}) {
		data.filterOptions.forEach(option => {
			const typeFormGroup: FormGroup = (this.formGroup.get(option.type) as FormGroup);
			let valueGroup = data.value[option.type];

			Object.keys(valueGroup).forEach(key => {
				const value = valueGroup[key];

				if(typeFormGroup.contains(key)){
					typeFormGroup.get(key).setValue(value, {emitEvent: false});
				}
				else{
					switch (option.type) {
						case "single":
						case "shop-item":
							typeFormGroup.addControl(option.key, this.fb.control(value));
							break;
						case "multiple":
							typeFormGroup.addControl(option.key, this.fb.group(
								Object.keys(value).reduce((acc, key) => {
									acc[key] = this.fb.control(value[key]);
									return acc;
								}, {})
							));
							break;
						case "date-range":
							typeFormGroup.addControl(option.key, this.fb.group({
								from: this.fb.control((value as any).from),
								to: this.fb.control((value as any).to)
							}));
							break;
					}
				}
			})
		});
		console.log(this.formGroup.getRawValue());
	}

	ngOnInit() {
	}

}

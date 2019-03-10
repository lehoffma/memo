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
		"single": this.fb.control(""),
		"multiple": this.fb.group({}),
		"date-range": this.fb.group({
			from: undefined,
			to: undefined
		}),
		"shop-item": this.fb.control([])
	});

	constructor(public dialogRef: MatDialogRef<FilterDialogComponent>,
				private fb: FormBuilder,
				@Inject(MAT_DIALOG_DATA) public data: {
					filterOptions: FilterOption[],
					value: FilterFormValue
				}) {
		data.filterOptions.forEach(option => {
			const childFormGroup: FormGroup = (this.formGroup.get(option.type) as FormGroup);
			let value = data.value[option.type];
			switch (option.type) {
				case "single":
				case "shop-item":
					childFormGroup.addControl(option.key, this.fb.control(value));
					break;
				case "multiple":
				case "date-range":
					childFormGroup.addControl(option.key, this.fb.group(value));
					break;
			}
		})
		console.log(this.formGroup.getRawValue());
	}

	ngOnInit() {
	}

}

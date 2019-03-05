import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {MultiLevelSelectParent} from "../../../utility/multi-level-select/shared/multi-level-select-parent";
import {FormGroup} from "@angular/forms";

@Component({
	selector: "memo-filter-dialog",
	templateUrl: "./filter-dialog.component.html",
	styleUrls: ["./filter-dialog.component.scss"]
})
export class FilterDialogComponent implements OnInit {

	constructor(public dialogRef: MatDialogRef<FilterDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: { filterOptions: MultiLevelSelectParent[], singleSelectionForm: FormGroup, multiSelectionForm: FormGroup }) {

	}

	ngOnInit() {
	}

}

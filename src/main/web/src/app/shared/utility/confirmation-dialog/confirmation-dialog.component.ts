import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
	selector: "memo-confirmation-dialog",
	templateUrl: "./confirmation-dialog.component.html",
	styleUrls: ["./confirmation-dialog.component.scss"]
})
export class ConfirmationDialogComponent implements OnInit {
	public message: string = "";

	constructor(private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any) {
	}


	ngOnInit() {
		this.message = this.data.message;
	}

	confirm() {
		this.dialogRef.close(true);
	}
}

import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
	selector: "memo-confirmation-dialog",
	templateUrl: "./confirmation-dialog.component.html",
	styleUrls: ["./confirmation-dialog.component.scss"]
})
export class ConfirmationDialogComponent implements OnInit {
	public message: string = "";
	public confirmMessage: string = "Ja";
	public cancelMessage: string = "Nein";

	constructor(private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: {message: string; confirmMessage?: string; cancelMessage?: string;}) {
	}


	ngOnInit() {
		this.message = this.data.message;
		if(this.data.confirmMessage){
			this.confirmMessage = this.data.confirmMessage;
		}
		if(this.data.cancelMessage){
			this.cancelMessage = this.data.cancelMessage;
		}
	}

	confirm() {
		this.dialogRef.close(true);
	}
}

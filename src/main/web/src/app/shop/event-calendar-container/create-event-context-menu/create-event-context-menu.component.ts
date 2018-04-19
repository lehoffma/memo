import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Observable} from "rxjs/Observable";

@Component({
	selector: "memo-create-event-context-menu",
	templateUrl: "./create-event-context-menu.component.html",
	styleUrls: ["./create-event-context-menu.component.scss"]
})
export class CreateEventContextMenuComponent implements OnInit {
	isoDate: string;

	constructor(private dialogRef: MatDialogRef<CreateEventContextMenuComponent>,
				@Inject(MAT_DIALOG_DATA) public data: {
					date: Date,
					partys: Observable<boolean>,
					tours: Observable<boolean>
				}) {

	}

	ngOnInit() {
		this.isoDate = this.data.date.toISOString();
	}

	close() {
		this.dialogRef.close();
	}

}

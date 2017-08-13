import {Component, Inject, OnInit} from "@angular/core";
import {MD_DIALOG_DATA, MdDialogRef} from "@angular/material";
import {Observable} from "rxjs/Observable";
import * as moment from "moment";

@Component({
	selector: "memo-create-event-context-menu",
	templateUrl: "./create-event-context-menu.component.html",
	styleUrls: ["./create-event-context-menu.component.scss"]
})
export class CreateEventContextMenuComponent implements OnInit {
	isoDate: string;

	constructor(private dialogRef: MdDialogRef<CreateEventContextMenuComponent>,
				@Inject(MD_DIALOG_DATA) public data: {
					date: Date,
					partys: Observable<boolean>,
					tours: Observable<boolean>
				}) {

	}

	ngOnInit() {
		this.isoDate = moment(this.data.date).toISOString();
	}

	close() {
		this.dialogRef.close();
	}

}

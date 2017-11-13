import {Injectable} from "@angular/core";
import {MatDialog} from "@angular/material";
import {ConfirmationDialogComponent} from "../confirmation-dialog/confirmation-dialog.component";
import {Observable} from "rxjs/Observable";

@Injectable()
export class ConfirmationDialogService {

	constructor(private mdDialog: MatDialog) {
	}

	openDialog(message: string): Observable<any> {
		let dialogRef = this.mdDialog.open(ConfirmationDialogComponent, {
			data: {
				message
			}
		});
		return dialogRef.afterClosed();
	}
}

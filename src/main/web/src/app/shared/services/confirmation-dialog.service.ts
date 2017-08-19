import {Injectable} from "@angular/core";
import {MdDialog} from "@angular/material";
import {Observable} from "rxjs/Observable";
import {ConfirmationDialogComponent} from "../confirmation-dialog/confirmation-dialog.component";

@Injectable()
export class ConfirmationDialogService {

	constructor(private mdDialog: MdDialog) {
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

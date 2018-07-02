import {Injectable} from "@angular/core";
import {MatDialog} from "@angular/material";
import {ConfirmationDialogComponent} from "../utility/confirmation-dialog/confirmation-dialog.component";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

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

	openWithCallback<T>(message: string, callback: () => T): Observable<T | null> {
		return this.openDialog(message)
			.pipe(map(yes => {
				if (yes) {
					return callback();
				}
				return null;
			}))
	}

	open<T>(message: string, callback: () => T): void {
		this.openWithCallback(message, callback).subscribe();
	}
}

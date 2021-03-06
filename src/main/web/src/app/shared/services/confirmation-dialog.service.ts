import {Injectable} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmationDialogComponent} from "../utility/confirmation-dialog/confirmation-dialog.component";
import {Observable} from "rxjs";
import {filter, map} from "rxjs/operators";

export interface ConfirmDialogOptions {
	title: string;
	confirmMessage: string;
	cancelMessage: string;
}

@Injectable()
export class ConfirmationDialogService {

	constructor(private mdDialog: MatDialog) {
	}

	openDialog(message: string, options: Partial<ConfirmDialogOptions> = {}): Observable<any> {
		let data = {message, ...options};

		let dialogRef = this.mdDialog.open(ConfirmationDialogComponent, {data});
		return dialogRef.afterClosed();
	}

	openDialogWithConfirmation(message: string, options: Partial<ConfirmDialogOptions> = {}): Observable<any> {
		return this.openDialog(message, options).pipe(
			filter(yes => yes)
		)
	}

	openWithCallback<T>(message: string, callback: () => T, options?: Partial<ConfirmDialogOptions>): Observable<T | null> {
		return this.openDialog(message, options)
			.pipe(map(yes => {
				if (yes) {
					return callback();
				}
				return null;
			}))
	}

	open<T>(message: string, callback: () => T, options?: Partial<ConfirmDialogOptions>): void {
		this.openWithCallback(message, callback, options).subscribe();
	}
}

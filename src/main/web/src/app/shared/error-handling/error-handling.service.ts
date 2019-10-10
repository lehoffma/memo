import {Injectable} from "@angular/core";
import {Observable, throwError} from "rxjs";
import {MatSnackBar, MatSnackBarConfig} from "@angular/material/snack-bar";
import {SNACKBAR_PRESETS} from "../../util/util";
import {HttpErrorResponse} from "@angular/common/http";

export interface ErrorHandlingConfig {
	errorMessage: string,
	snackBarAction: string,
	snackBarConfig: MatSnackBarConfig;
	setError: (error: any) => void
}

@Injectable({
	providedIn: "root"
})
export class ErrorHandlingService {

	constructor(private snackBar: MatSnackBar,) {
	}

	public errorMessageSuffix(error: HttpErrorResponse): string {
		if (error.status === 403) {
			return "Du besitzt nicht die nötigen Rechte für diese Aktion.";
		} else if (error.status === 500) {
			return "Unerwarteter Fehler."
		} else if (error.status === 503 || error.status === 504) {
			return "Der Server antwortet nicht.";
		}

		return undefined;
	}

	public errorCallback(error: any, config: Partial<ErrorHandlingConfig> = {}): Observable<any> {
		if(error){
			console.error(error);
			if (config.setError) {
				config.setError(error);
			}
		}
		let errorMessageSuffix = error ? this.errorMessageSuffix(error) : "";

		let errorMessage = (config.errorMessage || "Es ist ein Fehler aufgetreten")
			+ (errorMessageSuffix ? (": " + errorMessageSuffix) : "");
		if(![".","!","?"].some(punctuation => errorMessage.endsWith(punctuation))){
			errorMessage += ".";
		}

		this.snackBar.open(
			errorMessage,
			config.snackBarAction || "Okay",
			config.snackBarConfig || {...SNACKBAR_PRESETS.error}
		);

		return throwError(error);
	}
}

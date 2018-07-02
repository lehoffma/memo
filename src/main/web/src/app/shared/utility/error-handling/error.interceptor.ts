import {Injectable} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {MatSnackBar} from "@angular/material";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

	constructor(private matSnackBar: MatSnackBar) {

	}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req)
			.pipe(
				catchError(error => {
					if (error instanceof HttpErrorResponse) {
						//todo
						// this.matSnackBar.open("Die Aktion konnte nicht ausgeführt werden. Grund: " + error.status + " " + error.statusText,
						// 	"Schließen", {
						// 		duration: 500000
						// 	});
					}
					return throwError(error);
				})
			);
	}

}

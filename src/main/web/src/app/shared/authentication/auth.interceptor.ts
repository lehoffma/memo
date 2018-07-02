import {Injectable, Injector} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {Observable, throwError} from "rxjs";
import {catchError, mergeMap} from "rxjs/operators";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	constructor(private inj: Injector) {

	}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		// Get the auth header from the service.
		const authService = this.inj.get(AuthService);

		const authReq = req.clone({
			setHeaders: {Authorization: "Bearer " + authService.getToken()}
		});
		return next.handle(authReq)
			.pipe(
				catchError(error => {
					if (error instanceof HttpErrorResponse && error.status === 401) {
						return authService.refreshAccessToken()
							.pipe(
								mergeMap(response => {
									let token = null;
									if (response && response.auth_token) {
										token = response.auth_token;
									}
									const repeatedAuthReq = req.clone({
										setHeaders: {Authorization: "Bearer " + token}
									});
									return next.handle(repeatedAuthReq);
								})
							)
					} else {
						return throwError(error);
					}
				})
			);
	}

}

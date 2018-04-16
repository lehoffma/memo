import {Injectable, Injector} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs/Observable";
import {catchError, mergeMap} from "rxjs/operators";
import {_throw} from "rxjs/observable/throw";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	constructor(private inj: Injector) {

	}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		// Get the auth header from the service.
		const authService = this.inj.get(AuthService);

		return authService.getRefreshedAccessToken()
			.pipe(
				mergeMap(accessToken => {
					const authReq = req.clone({
						setHeaders: {Authorization: "Bearer " + accessToken.auth_token}
					});
					return next.handle(authReq)
				}),
				catchError(error => {
					if (error instanceof HttpErrorResponse && error.status === 401) {
						return authService.refreshAccessToken()
							.pipe(
								mergeMap(response => {
									const repeatedAuthReq = req.clone({
										setHeaders: {Authorization: "Bearer " + response.auth_token}
									});
									return next.handle(repeatedAuthReq);
								})
							)
					} else {
						return _throw(error);
					}
				})
			)
	}

}

import {Injectable, Injector} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs/Rx";
import {AuthService} from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	constructor(private inj: Injector) {

	}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

		// Get the auth header from the service.
		const authService = this.inj.get(AuthService);

		const authReq = req.clone({
			setHeaders: {Authorization: 'Bearer ' + authService.getToken()}
		});
		return next.handle(authReq)
			.catch((error: any) => {
				if (error instanceof HttpErrorResponse && error.status === 401) {
					return authService.refreshAccessToken()
						.flatMap(response => {
							const repeatedAuthReq = req.clone({
								setHeaders: {Authorization: 'Bearer ' + response.auth_token}
							});
							return next.handle(repeatedAuthReq);
						})
				} else {
					return Observable.throw(error);
				}
			})
	}

}

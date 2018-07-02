import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";

export abstract class HttpErrorGuard<T> implements CanActivate {
	protected constructor(protected statusCode: number,
						  protected redirectLink: string,
						  protected router: Router) {
	}


	canActivatePage(request: Observable<T>, statusCode: number, redirectLink: string, router: Router) {
		return request
			.pipe(
				map(value => true),
				catchError((error: HttpErrorResponse) => {
					//only handle the specified errors
					if (error.status === statusCode) {
						console.log("error!", error);
						console.log("redirecting to " + redirectLink);

						router.navigateByUrl(redirectLink, {skipLocationChange: true})
							.then(value => console.log(value));

						return of(false);
					}
					return of(true);
				})
			)
	}


	abstract getRequest(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<T>;

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return this.canActivatePage(this.getRequest(route, state), this.statusCode, this.redirectLink, this.router);
	}
}

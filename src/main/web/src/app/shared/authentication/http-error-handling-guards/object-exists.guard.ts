import {HttpErrorGuard} from "./http-error.guard";
import {Router} from "@angular/router";


export abstract class ObjectExistsGuard<T> extends HttpErrorGuard<T> {
	protected constructor(protected router: Router) {
		super(404, "page-not-found", router);
	}
}

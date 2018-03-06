import {HttpErrorGuard} from "./http-error.guard";
import {Router} from "@angular/router";

export abstract class ObjectIsVisibleToUserGuard<T> extends HttpErrorGuard<T> {
	protected constructor(protected router: Router) {
		super(403, "not-allowed", router);
	}
}

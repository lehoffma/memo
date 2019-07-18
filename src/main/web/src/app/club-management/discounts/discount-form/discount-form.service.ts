import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable({
	providedIn: "root"
})
export class DiscountFormService {

	refresh$ = new Subject();

	constructor() {
	}

	refresh(){
		this.refresh$.next(true);
	}
}

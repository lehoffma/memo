import {OnDestroy} from "@angular/core";
import {Subject} from "rxjs";

export class DestroyableComponent implements OnDestroy {
	onDestroy$: Subject<any> = new Subject<any>();

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}
}

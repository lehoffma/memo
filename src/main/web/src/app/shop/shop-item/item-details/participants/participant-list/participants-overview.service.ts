import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {filter} from "rxjs/operators";
import {RowAction} from "../../../../../shared/utility/material-table/util/row-action";
import {RowActionType} from "../../../../../shared/utility/material-table/util/row-action-type";


@Injectable({
	providedIn: "root"
})
export class ParticipantsOverviewService {

	private reloadTrigger$: Subject<"participants" | "waiting-list" | "both"> = new Subject();

	constructor() {
	}

	watchReload(which: "participants" | "waiting-list"){
		return this.reloadTrigger$.pipe(filter(kind => kind === which || kind === "both"));
	}

	reload(which: "participants" | "waiting-list" | "both" = "both"){
		this.reloadTrigger$.next(which);
	}
}

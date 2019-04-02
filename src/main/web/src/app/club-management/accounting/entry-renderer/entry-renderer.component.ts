import {Component, Input, OnInit} from "@angular/core";
import {Entry} from "../../../shared/model/entry";
import {BehaviorSubject, Observable} from "rxjs";
import {User} from "../../../shared/model/user";
import {mergeMap} from "rxjs/operators";
import {ResponsibilityService} from "../../../shop/shared/services/responsibility.service";

@Component({
	selector: "memo-entry-renderer",
	templateUrl: "./entry-renderer.component.html",
	styleUrls: ["./entry-renderer.component.scss"]
})
export class EntryRendererComponent implements OnInit {
	entry$: BehaviorSubject<Entry> = new BehaviorSubject(null);

	@Input() set entry(entry: Entry) {
		this.entry$.next(entry);
	}

	get entry() {
		return this.entry$.getValue();
	}

	responsible$: Observable<User[]> = this.entry$
		.pipe(mergeMap(entry => this.responsibilityService.getResponsible(entry.item.id)));

	constructor(private responsibilityService: ResponsibilityService) {
	}

	ngOnInit() {
	}

}

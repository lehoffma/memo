import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {EventType} from "../../shared/model/event-type";
import {EventService} from "../../../shared/services/api/event.service";
import {Observable} from "rxjs/Observable";

@Component({
	selector: "memo-event-context-menu",
	templateUrl: "./event-context-menu.component.html",
	styleUrls: ["./event-context-menu.component.scss"]
})
export class EventContextMenuComponent implements OnInit, OnDestroy {

	subscription;
	constructor(private dialogRef: MatDialogRef<EventContextMenuComponent>,
				private eventService: EventService,
				@Inject(MAT_DIALOG_DATA) public data: {
					id: number,
					title: Observable<string>,
					eventType: Observable<EventType>,
					view: Observable<boolean>,
					edit: Observable<boolean>,
					remove: Observable<boolean>
				}) {

	}

	ngOnInit() {
		this.subscription = this.data.view.subscribe(console.log);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	close() {
		this.dialogRef.close();
	}

	deleteEvent() {
		this.eventService.remove(this.data.id)
			.subscribe(result => this.dialogRef.close("deleted"));
	}
}

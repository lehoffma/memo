import {Component, Inject, OnInit} from "@angular/core";
import {MD_DIALOG_DATA, MdDialogRef} from "@angular/material";
import {EventType} from "../../shared/model/event-type";
import {Observable} from "rxjs/Observable";
import {EventService} from "../../../shared/services/api/event.service";

@Component({
	selector: "memo-event-context-menu",
	templateUrl: "./event-context-menu.component.html",
	styleUrls: ["./event-context-menu.component.scss"]
})
export class EventContextMenuComponent implements OnInit {

	constructor(private dialogRef: MdDialogRef<EventContextMenuComponent>,
				private eventService: EventService,
				@Inject(MD_DIALOG_DATA) public data: {
					id: number,
					title: Observable<string>,
					eventType: Observable<EventType>,
					view: Observable<boolean>,
					edit: Observable<boolean>,
					remove: Observable<boolean>
				}) {

	}

	ngOnInit() {
		this.data
			.view.subscribe(console.log);
	}

	close() {
		this.dialogRef.close();
	}

	deleteEvent() {
		this.eventService.remove(this.data.id)
			.subscribe(result => this.dialogRef.close("deleted"));
	}
}

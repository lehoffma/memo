import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {integerToType} from "../../shared/model/event-type";
import {EventService} from "../../../shared/services/api/event.service";
import {Observable} from "rxjs";
import {Event} from "../../shared/model/event";
import {AddressService} from "../../../shared/services/api/address.service";
import {filter, mergeMap} from "rxjs/operators";
import {ParticipantUser} from "../../shared/model/participant";
import {ConfirmationDialogService} from "../../../shared/services/confirmation-dialog.service";

@Component({
	selector: "memo-event-context-menu",
	templateUrl: "./event-context-menu.component.html",
	styleUrls: ["./event-context-menu.component.scss"]
})
export class EventContextMenuComponent implements OnInit, OnDestroy {

	subscription;
	userEquality = (a: ParticipantUser, b: ParticipantUser) => a.user.id === b.user.id;

	IntegerToType = integerToType;

	constructor(private dialogRef: MatDialogRef<EventContextMenuComponent>,
				private addressService: AddressService,
				private confirmationDialogService: ConfirmationDialogService,
				private eventService: EventService,
				@Inject(MAT_DIALOG_DATA) public data: {
					id: number,
					event: Observable<any>
				}) {

	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	close() {
		this.dialogRef.close();
	}

	deleteEvent() {
		this.confirmationDialogService.openDialog("Möchtest du dieses Event wirklich löschen?").pipe(
			filter(ok => ok),
			mergeMap(ok => this.eventService.remove(this.data.id))
		)
			.subscribe(result => this.dialogRef.close("deleted"));
	}
}

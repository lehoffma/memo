import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ParticipantUser} from "../../../../../shared/model/participant";
import {ModifyType} from "../../../../modify-shop-item/modify-type";
import {UserService} from "../../../../../../shared/services/api/user.service";
import {EventType} from "../../../../../shared/model/event-type";
import {OrderStatus, OrderStatusPairList} from "../../../../../../shared/model/order-status";
import {Event, ShopEvent} from "../../../../../shared/model/event";
import {WaitingListUser} from "../../../../../shared/model/waiting-list";
import {EventInfo} from "../participant-list.service";

export interface ModifyParticipantEvent {
	entry: ParticipantUser | WaitingListUser;
	modifyType: ModifyType,
	modifiedId: number;
}

@Component({
	selector: "memo-modify-participant",
	templateUrl: "./modify-participant.component.html",
	styleUrls: ["./modify-participant.component.scss"]
})
export class ModifyParticipantComponent implements OnInit {
	entry: ParticipantUser | WaitingListUser;
	associatedEventInfo: {
		eventType: EventType,
		eventId: number
	};
	associatedEvent: Event;

	availableStatus = OrderStatusPairList;

	constructor(private dialogRef: MatDialogRef<ModifyParticipantComponent>,
				public userService: UserService,
				@Inject(MAT_DIALOG_DATA) public data: {
					entry: ParticipantUser | WaitingListUser,
					associatedEventInfo: EventInfo,
					event: ShopEvent,
					editingParticipant: boolean,
				}) {
	}

	get isEditing() {
		return this.data && this.data.entry;
	}

	ngOnInit() {
		this.associatedEventInfo = this.data.associatedEventInfo;
		this.associatedEvent = this.data.event;
		if (this.isEditing) {
			this.entry = Object.assign({}, this.data.entry);
		} else {
			this.entry = {
				isDriver: false,
				needsTicket: false,
				description: "",
				price: 0,
				item: this.associatedEvent,
				id: -1,
				user: null
			} as any;

			if (this.data.editingParticipant) {
				(this.entry as any).status = OrderStatus.RESERVED;
			}
		}
	}


	/**
	 *
	 */
	emitDoneEvent() {
		let modifyType: ModifyType = this.isEditing ? ModifyType.EDIT : ModifyType.ADD;
		let modifiedParticipant: number = this.isEditing ? this.data.entry.id : null;
		this.dialogRef.close({
			entry: this.entry,
			modifyType,
			modifiedId: modifiedParticipant
		} as ModifyParticipantEvent);
	}
}

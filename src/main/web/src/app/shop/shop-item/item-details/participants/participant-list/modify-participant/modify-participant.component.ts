import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ParticipantUser} from "../../../../../shared/model/participant";
import {ModifyType} from "../../../../modify-shop-item/modify-type";
import {User} from "../../../../../../shared/model/user";
import {UserService} from "../../../../../../shared/services/api/user.service";
import {OrderedItemService} from "../../../../../../shared/services/api/ordered-item.service";
import {EventType} from "../../../../../shared/model/event-type";
import {OrderStatus, OrderStatusPairList} from "../../../../../../shared/model/order-status";
import {Event} from "../../../../../shared/model/event";

export interface ModifyParticipantEvent {
	participant: ParticipantUser
	modifyType: ModifyType,
	modifiedParticipant: ParticipantUser
}

@Component({
	selector: "memo-modify-participant",
	templateUrl: "./modify-participant.component.html",
	styleUrls: ["./modify-participant.component.scss"]
})
export class ModifyParticipantComponent implements OnInit {
	participant: ParticipantUser;
	associatedEventInfo: {
		eventType: EventType,
		eventId: number
	};
	associatedEvent: Event;

	availableStatus = OrderStatusPairList;

	constructor(private dialogRef: MatDialogRef<ModifyParticipantComponent>,
				private participantsService: OrderedItemService,
				public userService: UserService,
				@Inject(MAT_DIALOG_DATA) public data: any) {
		console.log(this.data);
	}

	get isEditing() {
		return this.data && this.data.participant;
	}

	ngOnInit() {
		this.associatedEventInfo = this.data.associatedEventInfo;
		this.associatedEvent = this.data.event;
		if (this.isEditing) {
			this.participant = Object.assign({}, this.data.participant);
		}
		else {
			this.participant = {
				isDriver: false,
				needsTicket: false,
				status: OrderStatus.RESERVED,
				price: 0,
				item: this.associatedEvent,
				id: -1,
				user: null
			}
		}
	}

	/**
	 * Filters the options array by checking the users first and last name
	 * @param options
	 * @param name
	 * @returns {any[]}
	 */
	filter(options: User[], name: string): User[] {
		return options.filter(option => {
			const regex = new RegExp(`^${name}`, "gi");
			return regex.test(option.firstName + " " + option.surname) || regex.test(option.surname);
		});
	}

	/**
	 * Defines how the user will be presented in the autocomplete box
	 * @param user
	 * @returns {any}
	 */
	displayFn(user: User): string {
		if (user) {
			return user.firstName + " " + user.surname;
		}
		return "";
	}

	/**
	 *
	 */
	emitDoneEvent() {
		let modifyType: ModifyType = this.isEditing ? ModifyType.EDIT : ModifyType.ADD;
		let modifiedParticipant: number = this.isEditing ? this.data.participant : null;
		this.dialogRef.close({
			participant: this.participant,
			modifyType,
			modifiedParticipant
		});
	}
}

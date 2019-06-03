import {ChangeDetectionStrategy, Component, Inject, OnInit} from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import {WaitingListEntry} from "../../../shared/model/waiting-list";
import {FormBuilder} from "@angular/forms";
import {EventType} from "../../../shared/model/event-type";
import {Event} from "../../../shared/model/event";
import {range} from "../../../../util/date-fns-adapter";
import {User} from "../../../../shared/model/user";

@Component({
	selector: "memo-manage-waiting-list-dialog",
	templateUrl: "./manage-waiting-list-dialog.component.html",
	styleUrls: ["./manage-waiting-list-dialog.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageWaitingListDialogComponent implements OnInit {
	waitingList: WaitingListEntry[];
	eventType = EventType;
	amount = 0;
	amountOptions = range(21, index => index - 1);

	constructor(@Inject(MAT_DIALOG_DATA) public data: {
					waitingList: WaitingListEntry[], eventType: EventType, event: Event, user: User,
				},
				private formBuilder: FormBuilder) {
		this.waitingList = [...data.waitingList];
		this.amount = this.waitingList.length;
		this.amountOptions = range((data.event.paymentLimit === -1 ? 20 : data.event.paymentLimit) + 1, index => index - 1);
	}

	ngOnInit() {
	}

	updateWaitingList(waitingList: WaitingListEntry[], newLength: number): WaitingListEntry[] {
		let list = [...waitingList];
		let diff = newLength - list.length;

		//we have to delete options
		if (diff < 0) {
			while (diff++ < 0) {
				list.splice(newLength - 1, 1);
			}
		}

		//we have to add dummy options
		else {
			let newEntry: WaitingListEntry = {
				id: -1,
				shopItem: this.data.event.id,
				user: this.data.user.id,
			};
			const entryOptions: Partial<WaitingListEntry> = this.data.eventType === EventType.tours
				? {isDriver: false, needsTicket: true}
				: (this.data.eventType === EventType.merch
					? {color: list[list.length - 1].color, size: list[list.length - 1].size}
					: {});

			newEntry = {
				...newEntry,
				...entryOptions
			};

			while (diff-- > 0) {
				list.push({...newEntry})
			}
		}

		return list;
	}

	updateEventAmount(amount: number) {
		this.waitingList = this.updateWaitingList(this.waitingList, amount);
	}
}

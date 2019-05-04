import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {User} from "../../../../shared/model/user";
import {EventType} from "../../../shared/model/event-type";

export interface GroupedParticipants {
	user: User;
	isDriverAmount: number;
	needsTicketAmount: number;
	extraPersons: number;
}

@Component({
	selector: "memo-participants",
	templateUrl: "./participants.component.html",
	styleUrls: ["./participants.component.scss"]
})
export class ParticipantsComponent implements OnInit {
	@Input() participants: GroupedParticipants[];
	@Input() type: EventType;
	@Input() isAllowedToSeeMetaInfo: boolean = false;
	@Input() canCheckIn = false;
	@Output() toRegistration = new EventEmitter();
	@Output() shareEvent = new EventEmitter();

	constructor() {
	}


	ngOnInit() {
	}
}

import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ParticipantUser} from "../../../../../shared/model/participant";
import {ModifyType} from "../../../../modify-shop-item/modify-type";
import {FormControl} from "@angular/forms";
import {User} from "../../../../../../shared/model/user";
import {UserService} from "../../../../../../shared/services/api/user.service";
import {EventUtilityService} from "../../../../../../shared/services/event-utility.service";
import {ParticipantsService} from "../../../../../../shared/services/api/participants.service";
import {EventType} from "../../../../../shared/model/event-type";
import {Observable} from "rxjs/Observable";
import {map, mergeMap, startWith} from "rxjs/operators";

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

	autocompleteFormControl = new FormControl();
	filteredOptions: Observable<User[]>;

	constructor(private dialogRef: MatDialogRef<ModifyParticipantComponent>,
				private participantsService: ParticipantsService,
				private userService: UserService,
				@Inject(MAT_DIALOG_DATA) public data: any) {
	}

	get isEditing() {
		return this.data && this.data.participant;
	}

	ngOnInit() {
		this.associatedEventInfo = this.data.associatedEventInfo;
		if (this.isEditing) {
			this.participant = Object.assign({}, this.data.participant);
			this.autocompleteFormControl.setValue(Object.assign({}, this.data.participant.user));
		}
		else {
			this.participant = {
				isDriver: false,
				hasPaid: false,
				id: -1,
				comments: "",
				user: null
			}
		}
		this.autocompleteFormControl.valueChanges
			.subscribe(value => this.participant.user = EventUtilityService.isUser(value)
				? value
				: null);


		this.filteredOptions = this.participantsService
			.getParticipantIdsByEvent(this.associatedEventInfo.eventId, this.associatedEventInfo.eventType)
			//dont filter out the user that is being edited so we can still select him while editing
			.pipe(
				map(participantIds => participantIds.filter(participant => this.participant.id !== participant.id)),
				mergeMap(participantIds => this.userService.search("")
					.pipe(
						map(users => users.filter(user => participantIds.every(participant => participant.id !== user.id)))
					)
				),
				mergeMap(users => this.autocompleteFormControl.valueChanges
					.pipe(
						startWith(null),
						map(user => user && typeof user === "object" ? user.name : user),
						map(name => name ? this.filter(users, name) : users.slice()))
					)
			);
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
		if (this.participant.id === -1) {
			this.participant.id = this.participant.user.id;
		}
		this.dialogRef.close({
			participant: this.participant,
			modifyType,
			modifiedParticipant
		});
	}
}

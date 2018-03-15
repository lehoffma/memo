import {Component, EventEmitter, OnDestroy, OnInit, Output} from "@angular/core";
import {ParticipantUser} from "../../../../shared/model/participant";
import {ParticipantsService} from "../../../../../shared/services/api/participants.service";
import {RowAction} from "../../../../../shared/expandable-table/row-action";
import {map} from "rxjs/operators";
import {Subscription} from "rxjs/Subscription";
import {User} from "../../../../../shared/model/user";
import {MemberListRowAction} from "../../../../../club-management/administration/member-list/member-list-row-actions";
import {ParticipantListService} from "./participant-list.service";


@Component({
	selector: "memo-participant-list",
	templateUrl: "./participant-list.component.html",
	styleUrls: ["./participant-list.component.scss"],
	providers: [ParticipantListService]
})
export class ParticipantListComponent implements OnInit, OnDestroy {

	rowActions: {
		icon?: string;
		name: string | RowAction;
		link?: (user: User) => string;
		route?: (user: User) => string;
	}[] = [
		{
			icon: "edit",
			name: RowAction.EDIT
		},
		{
			icon: "delete",
			name: RowAction.DELETE
		},
		{
			icon: "phone",
			name: MemberListRowAction.phone,
			link: user => "tel:" + user.telephone
		},
		{
			icon: "smartphone",
			name: MemberListRowAction.call,
			link: user => "tel:" + user.mobile
		},
		{
			icon: "email",
			name: MemberListRowAction.email,
			link: user => "mailto:" + user.email
		},
		{
			icon: "person",
			name: MemberListRowAction.showProfile,
			route: user => "/members/" + user.id
		}
	];


	isExpandable$ = this.participantListService.expandedRowKeys$
		.pipe(map(keys => keys.length > 0));

	subscriptions: Subscription[] = [];

	@Output() participantsChanged: EventEmitter<ParticipantUser[]> = new EventEmitter<ParticipantUser[]>();

	constructor(public participantListService: ParticipantListService,
				private participantService: ParticipantsService) {
		this.subscriptions.push(
			this.participantListService.participantsChanged.subscribe(value => this.participantsChanged.emit(value))
		);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}


}

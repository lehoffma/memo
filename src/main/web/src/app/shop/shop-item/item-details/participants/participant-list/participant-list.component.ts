import {Component, EventEmitter, OnDestroy, OnInit, Output} from "@angular/core";
import {ParticipantUser} from "../../../../shared/model/participant";
import {RowActionType} from "../../../../../shared/expandable-table/row-action-type";
import {map} from "rxjs/operators";
import {Subscription} from "rxjs/Subscription";
import {MemberListRowAction} from "../../../../../club-management/administration/member-list/member-list-row-actions";
import {ParticipantListService} from "./participant-list.service";
import {RowAction} from "../../../../../shared/expandable-table/expandable-table.component";


@Component({
	selector: "memo-participant-list",
	templateUrl: "./participant-list.component.html",
	styleUrls: ["./participant-list.component.scss"],
	providers: [ParticipantListService]
})
export class ParticipantListComponent implements OnInit, OnDestroy {

	rowActions: RowAction<ParticipantUser>[] = [
		{
			icon: "edit",
			name: RowActionType.EDIT
		},
		{
			icon: "delete",
			name: RowActionType.DELETE
		},
		{
			icon: "phone",
			name: MemberListRowAction.phone,
			predicate: participant => !!participant.user.telephone,
			link: participant => "tel:" + participant.user.telephone
		},
		{
			icon: "smartphone",
			name: MemberListRowAction.call,
			predicate: participant => !!participant.user.mobile,
			link: participant => "tel:" + participant.user.mobile
		},
		{
			icon: "email",
			name: MemberListRowAction.email,
			link: participant => "mailto:" + participant.user.email
		},
		{
			icon: "person",
			name: MemberListRowAction.showProfile,
			route: participant => "/members/" + participant.user.id
		}
	];


	isExpandable$ = this.participantListService.expandedRowKeys$
		.pipe(map(keys => keys.length > 0));

	subscriptions: Subscription[] = [];

	@Output() participantsChanged: EventEmitter<ParticipantUser[]> = new EventEmitter<ParticipantUser[]>();

	constructor(public participantListService: ParticipantListService) {
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

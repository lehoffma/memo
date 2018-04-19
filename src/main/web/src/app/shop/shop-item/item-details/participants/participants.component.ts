import {Component, Input, OnInit} from "@angular/core";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {User} from "../../../../shared/model/user";
import {ParticipantUser} from "../../../shared/model/participant";
import {animate, state, style, transition, trigger} from "@angular/animations";

const DEFAULT_AMOUNT_SHOWN = 3;

@Component({
	selector: "memo-participants",
	templateUrl: "./participants.component.html",
	styleUrls: ["./participants.component.scss"],
	animations: [
		trigger("expandedState", [
			state("1", style({transform: "rotate(180deg)"})),
			state("0", style({transform: "rotate(360deg)"})),
			transition("0 => 1", animate("200ms ease-in")),
			transition("1 => 0", animate("200ms ease-out")),
		]),
		//todo wäre voll cool :/
		trigger("slideInAndOut", [
			state("in", style({height: "*"})),
			transition("* => void", [
				style({height: "*"}),
				animate(250, style({height: 0}))
			])
		])
	]
})
export class ParticipantsComponent implements OnInit {
	@Input() participants: ParticipantUser[];
	expandedStatus = false;

	constructor(private navigationService: NavigationService) {
	}

	get amountOfParticipantsShown() {
		if (this.expandedStatus) {
			return this.participants.length;
		}
		return DEFAULT_AMOUNT_SHOWN;
	}

	ngOnInit() {
	}

	showDetailsOfUser(user: User) {
		let url: string = `members/${user.id}`;
		this.navigationService.navigateByUrl(url);
	}
}

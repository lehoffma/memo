import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {NavigationService} from "../../../shared/services/navigation.service";
import {User} from "../../../shared/model/user";
import {UserService} from "../../../shared/services/user.service";
import {Observable} from "rxjs/Observable";
import {ParticipantUser} from "../../shared/model/participant";

@Component({
	selector: "memo-participants",
	templateUrl: "./participants.component.html",
	styleUrls: ["./participants.component.scss"]
})
export class ParticipantsComponent implements OnInit{
	@Input() participants: ParticipantUser[];

	constructor(private navigationService: NavigationService) {
	}

	ngOnInit() {
	}

	showDetailsOfUser(user: User) {
		let url: string = `members/${user.id}`;
		this.navigationService.navigateByUrl(url);
	}
}

import {Component, Input, OnInit} from "@angular/core";
import {UserStore} from "../../../shared/stores/user.store";
import {NavigationService} from "../../../shared/services/navigation.service";
import {User} from "../../../shared/model/user";

@Component({
	selector: "memo-participants",
	templateUrl: "./participants.component.html",
	styleUrls: ["./participants.component.scss"]
})
export class ParticipantsComponent implements OnInit {
	@Input() participants: number[] = [];

	constructor(private userStore: UserStore,
				private navigationService: NavigationService) {
	}

	ngOnInit() {
	}

	getParticipants(ids: number[]) {
		return this.userStore.data.map(users => users.filter(user => ids.indexOf(user.id) !== -1));
	}

	showDetailsOfUser(user: User) {
		let url: string = `members/${user.id}`;
		this.navigationService.navigateByUrl(url);
	}
}

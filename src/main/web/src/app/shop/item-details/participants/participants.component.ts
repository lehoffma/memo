import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {NavigationService} from "../../../shared/services/navigation.service";
import {User} from "../../../shared/model/user";
import {UserService} from "../../../shared/services/user.service";
import {Observable} from "rxjs/Observable";

@Component({
	selector: "memo-participants",
	templateUrl: "./participants.component.html",
	styleUrls: ["./participants.component.scss"]
})
export class ParticipantsComponent implements OnInit, OnChanges {

	@Input() participantIds: number[] = [];
	participants: Observable<User[]> = this.convertIdsToUsers(this.participantIds);

	constructor(private userService: UserService,
				private navigationService: NavigationService) {
	}

	ngOnInit() {
		this.participants = this.convertIdsToUsers(this.participantIds);
	}

	convertIdsToUsers(ids: number[]): Observable<User[]> {
		return Observable.combineLatest(...ids.map(id => this.userService.getById(id), (...users) => [...users]))
	}

	ngOnChanges(changes: SimpleChanges): void {
		for (let propName in changes) {
			if (propName === "participantIds") {
				const change = changes[propName];
				if (!change.previousValue || (change.currentValue && change.previousValue[0] !== change.currentValue[0])) {
					this.participants = this.convertIdsToUsers(change.currentValue);
				}
			}
		}
	}

	showDetailsOfUser(user: User) {
		let url: string = `members/${user.id}`;
		this.navigationService.navigateByUrl(url);
	}
}

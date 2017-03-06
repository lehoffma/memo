import {Component, OnInit, Input} from "@angular/core";
import {User} from "../../shared/model/user";
import {UserStore} from "../../shared/stores/user.store";
import {NavigationService} from "../../shared/services/navigation.service";
import {Participant} from "../../shared/model/participant";

@Component({
    selector: 'details-participants',
    templateUrl: './object-details-participants.component.html',
    styleUrls: ["./object-details-participants.component.scss"]
})
export class DetailsParticipantsComponent implements OnInit {
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
import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {User} from "../../shared/model/user";
import {LogInService} from "../../shared/services/api/login.service";
import {map} from "rxjs/operators";
import {ClubRole, isAuthenticated} from "../../shared/model/club-role";

@Component({
	selector: "memo-sections",
	templateUrl: "./sections.component.html",
	styleUrls: ["./sections.component.scss"]
})
export class SectionsComponent implements OnInit {

	user$: Observable<User> = this.loginService.currentUser$;
	userIsBoardMember$: Observable<boolean> = this.user$.pipe(
		map((user: User) => user && isAuthenticated(user.clubRole, ClubRole.Vorstand))
	);

	constructor(private loginService: LogInService) {
	}

	ngOnInit() {
	}

}

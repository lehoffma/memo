import {Component, OnInit} from "@angular/core";
import {UserService} from "../../../shared/services/user.service";
import {User} from "../../../shared/model/user";
import {Observable} from "rxjs/Observable";

@Component({
	selector: "memo-member-list",
	templateUrl: "./member-list.component.html",
	styleUrls: ["./member-list.component.scss"]
})
export class MemberListComponent implements OnInit {
	public users: Observable<User[]> = this.userService.search("");

	constructor(private userService: UserService) {

	}

	ngOnInit() {
	}

}

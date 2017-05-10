import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {UserService} from "../../../shared/services/user.service";
import {Observable} from "rxjs/Observable";
import {User} from "../../../shared/model/user";

@Component({
	selector: "memo-profile-edit",
	templateUrl: "./profile-edit.component.html",
	styleUrls: ["./profile-edit.component.scss"]
})
export class ProfileEditComponent implements OnInit {
	public userObservable: Observable<User>;

	constructor(private route: ActivatedRoute,
				private userService: UserService) {
	}

	ngOnInit() {
		this.userObservable = this.route.params
			.map(params => +params["id"])
			.flatMap(id => this.userService.getById(id));
	}

}

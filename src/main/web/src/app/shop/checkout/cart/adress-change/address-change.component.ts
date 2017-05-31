import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {User} from "../../../../shared/model/user";
import {LogInService} from "../../../../shared/services/login.service";
import {UserService} from "../../../../shared/services/user.service";

@Component({
	selector: "address-change",
	templateUrl: "./address-change.component.html",
	styleUrls: ["./address-change.component.scss"]
})

export class AddressChangeComponent implements OnInit {
	userObservable: Observable<User>;

	constructor(private userService: UserService, private logInService: LogInService) {
	}

	ngOnInit() {
		const userId = this.logInService.accountObservable.map(user => {
			return user;
		})
		this.userObservable = userId.flatMap(id => this.userService.getById(id));
	}
}


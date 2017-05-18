import {Component, Input, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {UserService} from "../../shared/services/user.service";
import {Observable} from "rxjs/Observable";
import {ActivatedRoute} from "@angular/router";

@Component({
	selector: "memo-checkout",
	templateUrl: "./checkout.component.html",
	styleUrls: ["./checkout.component.scss"]
})
export class CheckoutComponent implements OnInit {
	//*ngIf="userObservable | async as user"
	userObservable: Observable<User>;
	constructor(//private route: ActivatedRoute, private userService: UserService
		 ) {

	}

	ngOnInit() {
		//const userId = this.route.params.map(params => +params["id"]);
		//this.userObservable = userId.flatMap(id => this.userService.getById(id));

	}

}

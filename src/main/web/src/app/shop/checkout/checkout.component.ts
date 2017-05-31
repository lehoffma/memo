import {Component, EventEmitter, Input, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {UserService} from "../../shared/services/user.service";
import {Observable} from "rxjs/Observable";
import {ActivatedRoute} from "@angular/router";
import {LogInService} from "../../shared/services/login.service";

@Component({
	selector: "memo-checkout",
	templateUrl: "./checkout.component.html",
	styleUrls: ["./checkout.component.scss"]
})
export class CheckoutComponent implements OnInit {
	paymentMethod: string;
	paymentMethodOptions: string []= ["Paypal", "Barzahlung", "Überweisung", "Lastschrift"];
	userObservable: Observable<User>;
	constructor(private route: ActivatedRoute, private userService: UserService, private logInService: LogInService) {

	}

	ngOnInit() {
		const userId = this.logInService.accountObservable.map(user =>{
			return user;
		})
		this.userObservable = userId.flatMap(id => this.userService.getById(id));

	}
	deleteCart(){
		/** hier sollten alle items im warenkorb gelöscht werden */

	}

}

import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";

@Component({
    selector: 'account-signup',
    templateUrl: './account-signup.component.html',
    styleUrls: ["./account-signup.component.scss"]
})
export class AccountSignUpComponent implements OnInit {
    private currentDate: Date = new Date();
    private newUser: User = new User();
    private password: string;
    private confirmedPassword: string;

    private sections = [0, 1, 2];
    private currentSection = 0;


    constructor() {
    }

    ngOnInit() {
    }

    checkPassword() {
        return this.password === this.confirmedPassword;
    }
}
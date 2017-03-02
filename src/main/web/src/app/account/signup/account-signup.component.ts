import {Component, OnInit} from "@angular/core";

@Component({
    selector: 'account-signup',
    templateUrl: './account-signup.component.html',
    styleUrls: ["./account-signup.component.scss"]
})
export class AccountSignUpComponent implements OnInit {
    private currentDate: Date = new Date();

    constructor() {
    }

    ngOnInit() {
    }

}
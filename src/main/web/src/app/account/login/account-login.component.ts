import {Component, OnInit} from "@angular/core";

@Component({
    selector: 'login',
    templateUrl: './account-login.component.html',
    styleUrls: ["./account-login.component.scss"]
})
export class AccountLoginComponent implements OnInit {
    private email: string = "";
    private password: string = "";

    constructor() {
    }

    ngOnInit() {
    }


    onSubmit() {

    }
}
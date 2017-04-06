import {Component, OnInit} from "@angular/core";

@Component({
	selector: "memo-login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
	private email: string = "";
	private password: string = "";

	constructor() {
	}

	ngOnInit() {
	}


	onSubmit() {

	}
}

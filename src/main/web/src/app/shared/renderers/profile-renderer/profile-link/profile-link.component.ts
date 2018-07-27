import {Component, Input} from "@angular/core";
import {User} from "../../../model/user";

@Component({
	selector: "memo-profile-link",
	templateUrl: "./profile-link.component.html",
	styleUrls: ["./profile-link.component.scss"]
})
export class ProfileLinkComponent {
	@Input() user: User;
	@Input() shortened: boolean = false;
	@Input() mouseLeaveDelay: number = 300;
	@Input() hoverDelay: number = 250;

	constructor() {
	}

}

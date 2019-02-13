import {Component, OnInit} from "@angular/core";
import {AccountSettingsService} from "./subsections/account-settings.service";

@Component({
	selector: "memo-user-settings",
	templateUrl: "./user-settings.component.html",
	styleUrls: ["./user-settings.component.scss"]
})
export class UserSettingsComponent implements OnInit {
	hasChanges$ = this.accountSettingsService.hasChanges$;
	formIsValid$ = this.accountSettingsService.formIsValid$;

	constructor(private accountSettingsService: AccountSettingsService) {
	}

	ngOnInit() {
	}

}

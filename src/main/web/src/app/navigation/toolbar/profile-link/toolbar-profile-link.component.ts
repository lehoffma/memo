import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {LogInService} from "../../../shared/services/login.service";
import {NavigationService} from "../../../shared/services/navigation.service";
import {Link} from "../../../shared/model/link";

@Component({
	selector: "memo-toolbar-profile-link",
	templateUrl: "./toolbar-profile-link.component.html",
	styleUrls: ["./toolbar-profile-link.component.scss"]
})
export class ToolbarProfileLinkComponent implements OnInit {
	loggedIn: Observable<boolean> = this.loginService.accountObservable
		.map(id => id !== null);
	accountLinks: Observable<Link[]> = this.navigationService.accountLinks;

	constructor(private loginService: LogInService,
				private navigationService: NavigationService) {
	}

	ngOnInit() {
	}


	/**
	 * Navigiert zur angegebenen URL
	 * @param url
	 */
	takeToPage(url: string) {
		this.navigationService.navigateByUrl(url);
	}

}

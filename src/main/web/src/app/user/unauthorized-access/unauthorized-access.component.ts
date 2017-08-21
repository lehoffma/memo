import {Component, OnInit} from "@angular/core";

@Component({
	selector: "memo-unauthorized-access",
	template: `
		<memo-error-page [errorCode]="403"
						 [errorMessage]="'Du hast nicht genügend Privilegien, um die angeforderte Seite zu betrachten.'">

		</memo-error-page>
	`,
})
export class UnauthorizedAccessComponent implements OnInit {

	constructor() {
	}

	ngOnInit() {
	}

}

import {Component, OnInit} from "@angular/core";

@Component({
	selector: "memo-page-not-found",
	template: `
		<memo-error-page [errorCode]="404" 
						 [errorMessage]="'Die Seite konnte nicht gefunden werden.'">
			
		</memo-error-page>	
	`
})
export class PageNotFoundComponent implements OnInit {

	constructor() {
	}

	ngOnInit() {
	}

}

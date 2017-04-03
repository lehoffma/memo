import {Component, Inject, OnInit} from "@angular/core";
import {MD_DIALOG_DATA} from "@angular/material";

@Component({
	selector: 'memo-event-image-popup',
	templateUrl: './object-image-popup.component.html',
	styleUrls: ['./object-image-popup.component.scss']
})
export class ObjectImagePopupComponent implements OnInit {

	constructor(//Injecte das 'data' object, welches wir im Parent übergeben haben
		@Inject(MD_DIALOG_DATA) public data: any) {
	}

	ngOnInit() {

	}

}

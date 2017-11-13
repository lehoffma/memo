import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material";

@Component({
	selector: "memo-item-image-popup",
	templateUrl: "./item-image-popup.component.html",
	styleUrls: ["./item-image-popup.component.scss"]
})
export class ItemImagePopupComponent implements OnInit {

	constructor(//Injecte das 'data' object, welches wir im Parent übergeben haben
		@Inject(MAT_DIALOG_DATA) public data: any) {
	}

	ngOnInit() {

	}
}

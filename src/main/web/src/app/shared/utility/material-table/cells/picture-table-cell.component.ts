import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";
import {MatDialog} from "@angular/material";
import {User} from "../../../model/user";
import {ItemImagePopupComponent} from "../../../../shop/shop-item/item-details/container/image-popup/item-image-popup.component";

@Component({
	selector: 'td [memoPictureTableCellComponent], memo-picture-table-cell',
	template: `
		<img src="{{data}}" (click)="openPreview(); $event.stopPropagation()"/>
	`,
	styleUrls: ["./picture-table-cell.component.scss"]
})

export class PictureTableCellComponent implements OnInit, ExpandableTableCellComponent {
	defaultPath = "resources/images/Logo.png";
	@Input() data: string;
	@Input() images: string[];

	constructor(private matDialog: MatDialog) {
	}

	ngOnInit() {
	}

	openPreview(){
		this.matDialog.open(ItemImagePopupComponent, {
			data: {
				images: this.images,
				imagePath: this.data
			}
		})
	}
}

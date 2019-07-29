import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";
import { MatDialog } from "@angular/material/dialog";
import {ItemImagePopupComponent} from "../../../../shop/shop-item/item-details/image-popup/item-image-popup.component";

@Component({
	selector: "td [memoPictureTableCellComponent], memo-picture-table-cell",
	template: `
		<ng-container *ngIf="!data || data.length === 0">
			<img [lazySrc]="defaultPath"
				 lazySrcVisible="visible"/>
		</ng-container>
		<ng-container *ngIf="data && data.length > 0">
			<img [lazySrc]="data[0] | imageSize:'small' | async"
				 lazySrcVisible="visible"
				 (click)="openPreview(); $event.stopPropagation()">
		</ng-container>
	`,
	styleUrls: ["./picture-table-cell.component.scss"]
})

export class PictureTableCellComponent implements OnInit, ExpandableTableCellComponent {
	defaultPath = "resources/images/Logo.png";
	@Input() data: string[];

	constructor(private matDialog: MatDialog) {
	}

	ngOnInit() {
	}

	openPreview() {
		this.matDialog.open(ItemImagePopupComponent, {
			data: {
				images: this.data,
				imagePath: this.data[0]
			}
		})
	}
}

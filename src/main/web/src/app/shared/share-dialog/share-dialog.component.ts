import {Component, Inject, OnInit} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
	selector: "memo-share-dialog",
	templateUrl: "./share-dialog.component.html",
	styleUrls: ["./share-dialog.component.scss"]
})
export class ShareDialogComponent implements OnInit {
	public title: string = "";
	public image: string = "";
	public shareDescription: string = "";
	public additionalTags: string[] = [];
	public url = "";
	public tags = ["Meilenwölfe", "Meilenwoelfe", "MeilenwoelfeShop", "VfL Wolfsburg"];

	constructor(private dialogRef: MatDialogRef<ShareDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any) {
	}


	ngOnInit() {
		const {title, image, url, additionalTags} = this.data;
		this.title = title;
		this.image = image;
		this.url = url;
		const type = url.includes("/tours/")
			? "Tour"
			: (url.includes("/partys/") ? "Veranstaltung" : "Merchandise-Artikel");
		this.shareDescription = `Schau dir diese${type === 'Merchandise-Artikel' ? 'n' : ''} ${type} an: `;
		this.additionalTags = additionalTags;
		this.tags = [...this.tags, ...this.additionalTags];
	}
}

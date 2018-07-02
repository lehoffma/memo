import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
	selector: "memo-share-dialog",
	templateUrl: "./share-dialog.component.html",
	styleUrls: ["./share-dialog.component.scss"]
})
export class ShareDialogComponent implements OnInit {
	public title: string = "";
	public image: string = "";
	public description: string = "";
	public additionalTags: string[] = [];
	public url = "";
	public tags = ["Meilenwölfe", "MeilenwoelfeShop"];

	constructor(private dialogRef: MatDialogRef<ShareDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any) {
	}


	ngOnInit() {
		const {title, image, url, description, additionalTags} = this.data;
		this.title = title;
		this.image = image;
		this.url = url;
		this.description = description;
		this.additionalTags = additionalTags;
		this.tags = [...this.tags, ...this.additionalTags];
	}
}

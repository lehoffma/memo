import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Comment} from "../../../../shared/model/comment";

@Component({
	selector: "memo-edit-comment-dialog",
	templateUrl: "./edit-comment-dialog.component.html",
	styleUrls: ["./edit-comment-dialog.component.scss"]
})
export class EditCommentDialogComponent implements OnInit {
	comment: Comment;
	text: string;

	constructor(private dialogRef: MatDialogRef<EditCommentDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any) {
	}

	ngOnInit() {
		this.comment = this.data.comment;
		this.text = this.comment.content;
	}

	saveComment() {
		this.dialogRef.close(this.comment);
	}

}

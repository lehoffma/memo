import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {User} from "../../../../../../shared/model/user";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";

@Component({
	selector: "memo-comment-input",
	templateUrl: "./comment-input.component.html",
	styleUrls: ["./comment-input.component.scss"]
})
export class CommentInputComponent implements OnInit, AfterViewInit {
	@Input() commentText: string;
	@Input() author: User;
	@Input() focus: boolean;
	@Input() submitCommentText = "Antworten";
	@Input() canBeCancelled = true;

	@Output() submitComment: EventEmitter<string> = new EventEmitter();
	@Output() closeSubmitComment: EventEmitter<any> = new EventEmitter();

	@ViewChild(CdkTextareaAutosize, {read: ElementRef}) commentInput: ElementRef;

	showActionButtons = true;

	constructor() {
	}

	ngOnInit() {
		this.closeSubmitComment.subscribe(event => {
			this.commentText = "";
			this.showActionButtons = false;
		});
	}

	ngAfterViewInit(): void {
		if (this.focus) {
			this.commentInput.nativeElement.focus();
		}
	}


	submit() {
		this.submitComment.emit(this.commentText);
	}
}

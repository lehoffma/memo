import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output
} from "@angular/core";
import {Comment} from "../../../shared/model/comment";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {LogInService} from "../../../../shared/services/api/login.service";
import {Observable} from "rxjs/Observable";
import {CommentService} from "../../../../shared/services/api/comment.service";

@Component({
	selector: "memo-comments-section",
	templateUrl: "./comments-section.component.html",
	styleUrls: ["./comments-section.component.scss"],
	animations: [
		trigger("expandedState", [
			state("1", style({transform: "rotate(180deg)"})),
			state("0", style({transform: "rotate(360deg)"})),
			transition("0 => 1", animate("200ms ease-in")),
			transition("1 => 0", animate("200ms ease-out")),
		])
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsSectionComponent implements OnInit {
	@Input() comments: Comment[];
	@Input() eventId: number;
	@Output() onDeleteComment = new EventEmitter<{ comment: Comment, parentId: number }>();
	readonly DEFAULT_AMOUNT_OF_COMMENTS_SHOWN = 3;
	loggedInUser$ = this.loginService.currentUser()
		.flatMap(user => user === null ? Observable.empty() : Observable.of(user));
	expandState = false;
	dummyComment = Comment.create();
	loadingAddedComment = false;

	constructor(private loginService: LogInService,
				private changeDetectorRef: ChangeDetectorRef,
				private commentService: CommentService) {
	}

	get amountOfCommentsShown() {
		return this.expandState
			? this.comments.length
			: this.DEFAULT_AMOUNT_OF_COMMENTS_SHOWN;
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param commentText
	 * @param parentId
	 */
	addComment(commentText: string, parentId: number) {
		console.log(commentText, parentId);
		if (parentId === -1) {
			this.loginService.currentUser()
				.first()
				.subscribe((user) => {
					let comment = new Comment(this.eventId, -1, new Date(), user.id, commentText);
					this.dummyComment = this.dummyComment.setProperties({
						text: "",
						authorId: user.id,
						timeStamp: comment.timeStamp,
						eventId: this.eventId,
					});
					this.loadingAddedComment = true;
					this.changeDetectorRef.detectChanges();

					this.commentService.add(comment, parentId)
						.subscribe(addResult => {
							console.log(addResult);
							this.comments.push(addResult);
							this.loadingAddedComment = false;
							this.changeDetectorRef.detectChanges();
						}, error => {
							console.error("adding the comment went wrong");
							console.error(error);
						})
				})
		}
	}

	/**
	 *
	 * @param {Comment} comment
	 * @param parentId
	 */
	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id)
			.subscribe(addResult => {
				let indexOfChildId = this.comments.findIndex(childComment => comment.id === childComment.id);
				if (indexOfChildId >= 0) {
					this.comments.splice(indexOfChildId, 1);
				}
				this.comments = [...this.comments];
				this.changeDetectorRef.detectChanges();
			}, error => {
				console.error("removing the comment went wrong", error);
			})
	}

	toggleShowMore() {
		this.expandState = !this.expandState;
	}


	trackCommentBy(index: number, comment: Comment) {
		return comment.id;
	}
}

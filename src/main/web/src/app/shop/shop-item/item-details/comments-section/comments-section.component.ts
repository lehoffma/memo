import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Comment, createComment} from "../../../shared/model/comment";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {LogInService} from "../../../../shared/services/api/login.service";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {of} from "rxjs";
import {catchError, first, mergeMap, tap} from "rxjs/operators";
import {EMPTY} from "rxjs";
import {setProperties} from "../../../../shared/model/util/base-object";

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
	@Input() canLoadMore: boolean;
	@Output() loadMore: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onDeleteComment = new EventEmitter<{ comment: Comment, parentId: number }>();
	readonly DEFAULT_AMOUNT_OF_COMMENTS_SHOWN = 3;
	loggedInUser$ = this.loginService.currentUser$
		.pipe(
			mergeMap(user => user === null ? EMPTY : of(user))
		);
	expandState = false;
	dummyComment = createComment();
	loadingAddedComment = false;

	constructor(private loginService: LogInService,
				private changeDetectorRef: ChangeDetectorRef,
				private commentService: CommentService) {
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
			this.loginService.currentUser$
				.pipe(
					first(),
					mergeMap(user => {
						let comment = setProperties(createComment(), {
							item: this.eventId,
							id: -1,
							timeStamp: new Date(),
							author: user.id,
							content: commentText,
						});
						this.dummyComment = setProperties(this.dummyComment, {
							content: "",
							author: user.id,
							timeStamp: comment.timeStamp,
							item: this.eventId,
						});
						this.loadingAddedComment = true;
						this.changeDetectorRef.detectChanges();

						return this.commentService.add(comment);
					}),
					tap(addResult => {
						console.log(addResult);
						this.comments.push(addResult);
						this.loadingAddedComment = false;
						this.changeDetectorRef.detectChanges();
					}),
					catchError(error => {
						console.error("adding the comment went wrong");
						console.error(error);
						return EMPTY;
					})
				)
				.subscribe()
		}
	}

	/**
	 *
	 * @param {Comment} comment
	 * @param parentId
	 */
	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id)
			.subscribe(() => {
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

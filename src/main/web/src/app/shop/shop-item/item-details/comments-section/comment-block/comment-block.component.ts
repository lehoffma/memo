import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Comment} from "../../../../shared/model/comment";
import {CommentService} from "../../../../../shared/services/comment.service";
import {Observable} from "rxjs/Observable";
import {User} from "../../../../../shared/model/user";
import {UserService} from "../../../../../shared/services/user.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {LogInService} from "../../../../../shared/services/login.service";
import {Router} from "@angular/router";
import {MdDialog} from "@angular/material";
import {EditCommentDialogComponent} from "../edit-comment-dialog/edit-comment-dialog.component";
import {ConfirmationDialogService} from "../../../../../shared/services/confirmation-dialog.service";

@Component({
	selector: "memo-comment-block",
	templateUrl: "./comment-block.component.html",
	styleUrls: ["./comment-block.component.scss"]
})
export class CommentBlockComponent implements OnInit {
	_comment$ = new BehaviorSubject<Comment>(null);
	comment$ = this._comment$.asObservable()
		.filter(comment => comment !== null);
	author$: Observable<User> = this.comment$
		.flatMap(comment => this.userService.getById(comment.authorId));
	children$: Observable<Comment[]> = this.comment$
		.flatMap(comment => comment.children.length === 0
			? Observable.of([])
			: Observable.combineLatest(...comment.children.map(child => this.commentService.getById(child)))
		)
		//merge comments via scan to avoid a complete reload every time someones adds a comment
		.scan(this.mergeValues.bind(this), []);
	@Input() parentId: number;
	@Input() eventId: number;
	@Input() dummy: boolean = false;
	@Output() onAddComment = new EventEmitter<{ commentText: string, parentCommentId: number }>();
	@Output() onDelete = new EventEmitter<{ comment: Comment, parentId: number }>();
	loggedInUser: User | null = null;
	loggedInUser$: Observable<User> = this.loginService.currentUser()
		.flatMap(user => user === null ? Observable.empty() : Observable.of(user));
	showChildren = false;
	showReplyBox = false;
	dummyComment: Comment = Comment.create();
	loadingChildren: boolean = false;

	constructor(private commentService: CommentService,
				private loginService: LogInService,
				private confirmationDialogService: ConfirmationDialogService,
				private dialogService: MdDialog,
				private changeDetectorRef: ChangeDetectorRef,
				private router: Router,
				private userService: UserService) {
	}

	@Input()
	set comment(comment: Comment) {
		this._comment$.next(comment);
	}

	ngOnInit() {
		this.loginService.currentUser().subscribe(value => this.loggedInUser = value);
	}

	isTouchDevice() {
		//todo before converting to app: window/navigator service
		return "ontouchstart" in window        // works on most browsers
			|| navigator.maxTouchPoints;       // works on IE10/11 and Surface
	};

	/**
	 * Modifies the given array so that it contains the updated values of the second array
	 * This allows us to display a newly added comment directly in the comments without a full reload
	 * (which would happen if we just used the comments array directly)
	 * @param {Comment[]} acc
	 * @param {Comment[]} comments
	 * @returns {Comment[]}
	 */
	mergeValues(acc: Comment[], comments: Comment[]) {
		if (!acc || comments.length === 0) {
			return comments;
		}
		//remove values that are not part of the array anymore
		for (let i = acc.length - 1; i >= 0; i--) {
			if (comments.findIndex(comment => comment.id === acc[i].id) === -1) {
				acc.splice(i, 1);
			}
		}

		//add comments that arent yet part of the array to the array
		acc.push(
			...comments.filter(comment =>
				!acc.find(prevComment => prevComment.id === comment.id)
			)
		);
		return acc;
	}

	/**
	 *
	 * @param commentText
	 * @param parentCommentId
	 */
	addComment(commentText: string, parentCommentId: number) {
		console.log(commentText, parentCommentId);
		let currentComment: Comment = this._comment$.value;
		if (parentCommentId === currentComment.id) {
			this.loginService.currentUser()
				.first()
				.subscribe((user) => {
					let comment = new Comment(this.eventId, -1, new Date(), user.id, commentText);
					// this.dummyComment = this.dummyComment.setProperties({
					// 	text: "",
					// 	authorId: user.id,
					// 	timeStamp: comment.timeStamp,
					// 	eventId: this.eventId,
					// });
					this.showChildren = true;
					// this.loadingChildren = true;
					this.changeDetectorRef.detectChanges();
					this.commentService.add(comment, currentComment.id)
						.subscribe(addResult => {
							currentComment.children.push(addResult.id);
							this.comment = Object.assign({}, currentComment);
							// this.loadingChildren = false;
						}, error => {
							console.error("adding the comment went wrong");
							console.error(error);
						})
				});
		}
		else {
			this.onAddComment.emit({commentText, parentCommentId});
		}
	}

	/**
	 *
	 */
	replyToComment(parent: Comment) {
		if (this.loginService.isLoggedIn()) {
			if (parent.children && parent.children.length > 0) {
				this.showChildren = true;
			}
			this.showReplyBox = true;
		}
		else {
			this.loginService.redirectUrl = this.router.url;
			this.router.navigate(["login"]);
		}
	}


	/**
	 *
	 */
	editComment(comment: Comment) {
		let dialogRef = this.dialogService.open(EditCommentDialogComponent, {
			data: {
				comment
			}
		});
		dialogRef.afterClosed()
			.flatMap((newComment: Comment) => {
				if (newComment && newComment.text) {
					return this.commentService.modify(newComment, this.parentId);
				}
				//otherwise, the user clicked close/cancel
				return Observable.empty()
			})
			.subscribe(response => {
					this.changeDetectorRef.detectChanges();
				},
				error => {
					console.error(error);
				})
	}

	/**
	 *
	 * @param {Comment} comment
	 * @param {number} parentId
	 */
	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		let currentComment: Comment = this._comment$.value;
		if (parentId === currentComment.id) {
			this.commentService.remove(comment.id, currentComment.id)
				.subscribe(addResult => {
					let indexOfChildId = currentComment.children.findIndex(childId => comment.id === childId);
					if (indexOfChildId >= 0) {
						currentComment.children.splice(indexOfChildId, 1);
					}
					if (currentComment.children.length === 0) {
						this.showChildren = false;
					}
					this.comment = Object.assign({}, currentComment);
					this.changeDetectorRef.detectChanges();
				}, error => {
					console.error("removing the comment went wrong", error);
				})
		}
		else {
			this.onDelete.emit({comment, parentId});
		}
	}

	/**
	 *
	 */
	deleteCurrentComment() {
		this.confirmationDialogService.openDialog(
			"Möchtest du diesen Kommentar wirklich löschen?"
		).subscribe(accepted => {
			if (accepted) {
				this.deleteComment({comment: this._comment$.value, parentId: this.parentId});
			}
		})
	}

	/**
	 *
	 * @param {Comment} comment
	 * @param parentId
	 */
	deleteChildComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.deleteComment({comment, parentId});
	}

	trackCommentBy(index: number, comment: Comment) {
		return comment.id;
	}
}

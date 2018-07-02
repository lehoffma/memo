import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {Comment, createComment} from "../../../../shared/model/comment";
import {CommentService} from "../../../../../shared/services/api/comment.service";
import {User} from "../../../../../shared/model/user";
import {UserService} from "../../../../../shared/services/api/user.service";
import {LogInService} from "../../../../../shared/services/api/login.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material";
import {EditCommentDialogComponent} from "../edit-comment-dialog/edit-comment-dialog.component";
import {ConfirmationDialogService} from "../../../../../shared/services/confirmation-dialog.service";
import {WindowService} from "../../../../../shared/services/window.service";
import {BehaviorSubject, combineLatest, Observable, of, Subscription} from "rxjs";
import {filter, first, mergeMap, scan, tap} from "rxjs/operators";
import {distanceInWordsStrict} from "date-fns";
import * as deLocale from "date-fns/locale/de";
import {EMPTY} from "rxjs";
import {setProperties} from "../../../../../shared/model/util/base-object";

@Component({
	selector: "memo-comment-block",
	templateUrl: "./comment-block.component.html",
	styleUrls: ["./comment-block.component.scss"]
})
export class CommentBlockComponent implements OnInit, OnDestroy {
	_comment$ = new BehaviorSubject<Comment>(null);
	comment$ = this._comment$.asObservable()
		.pipe(
			filter(comment => comment !== null && comment !== undefined),
		);
	author$: Observable<User> = this.comment$
		.pipe(
			mergeMap(comment => this.userService.getById(comment.author))
		);
	children$: Observable<Comment[]> = this.comment$
		.pipe(
			mergeMap(comment => comment.children.length === 0
				? of([])
				: combineLatest(...comment.children.map(child => this.commentService.getById(child)))),
			//merge comments via scan to avoid a complete reload every time someones adds a comment
			scan(this.mergeValues.bind(this), [])
		);
	@Input() parentId: number;
	@Input() eventId: number;
	@Input() dummy: boolean = false;
	@Output() onAddComment = new EventEmitter<{ commentText: string, parentCommentId: number }>();
	@Output() onDelete = new EventEmitter<{ comment: Comment, parentId: number }>();
	loggedInUser: User | null = null;
	loggedInUser$: Observable<User> = this.loginService.currentUser$
		.pipe(
			mergeMap(user => user === null ? EMPTY : of(user))
		);
	showChildren = false;
	showReplyBox = false;
	dummyComment: Comment = createComment();
	loadingChildren: boolean = false;

	private subscription: Subscription;

	constructor(private commentService: CommentService,
				private loginService: LogInService,
				private confirmationDialogService: ConfirmationDialogService,
				private dialogService: MatDialog,
				private changeDetectorRef: ChangeDetectorRef,
				private router: Router,
				private windowService: WindowService,
				private userService: UserService) {
	}

	@Input()
	set comment(comment: Comment) {
		this._comment$.next(comment);
	}

	ngOnInit() {
		this.subscription = this.loginService.currentUser$.subscribe(value => this.loggedInUser = value);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	isTouchDevice() {
		return this.windowService.isTouchDevice();
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
		let currentComment: Comment = this._comment$.value;
		//limit to 2 levels (q&a)
		if(currentComment.parent === null){
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
							parent: currentComment.id
						});
						this.dummyComment = setProperties(this.dummyComment, {
							content: "",
							author: user.id,
							timeStamp: comment.timeStamp,
							item: this.eventId,
						});
						this.showChildren = true;
						this.showReplyBox = false;
						this.loadingChildren = true;
						this.changeDetectorRef.detectChanges();
						return this.commentService.add(comment)
							.pipe(
								tap(addResult => {
									currentComment.children.push(addResult.id);
									this.comment = Object.assign({}, currentComment);
									this.showReplyBox = false;
									this.loadingChildren = false;
								})
							);
					})
				)
				.subscribe();
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
			.pipe(
				mergeMap((newComment: Comment) => {
					if (newComment && newComment.content) {
						return this.commentService.modify(newComment);
					}
					//otherwise, the user clicked close/cancel
					return EMPTY;
				}),
				first()
			)
			.subscribe(() => this.changeDetectorRef.detectChanges(), console.error)
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
				.subscribe(() => {
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

	distanceInWords(date: Date) {
		return distanceInWordsStrict(new Date(), date, {addSuffix: true, locale: deLocale});
	}
}

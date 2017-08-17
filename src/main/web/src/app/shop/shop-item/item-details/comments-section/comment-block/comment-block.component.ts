import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Comment} from "../../../../shared/model/comment";
import {CommentService} from "../../../../../shared/services/comment.service";
import {Observable} from "rxjs/Observable";
import {User} from "../../../../../shared/model/user";
import {UserService} from "../../../../../shared/services/user.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {LogInService} from "../../../../../shared/services/login.service";
import {NavigationService} from "../../../../../shared/services/navigation.service";
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

	@Input()
	set comment(comment: Comment) {
		this._comment$.next(comment);
	}


	@Input() parentId: number;

	@Output() onAddComment = new EventEmitter<{ commentText: string, parentCommentId: number }>();
	@Output() onDelete = new EventEmitter<{ comment: Comment, parentId: number }>();

	author$: Observable<User> = this.comment$
		.flatMap(comment => this.userService.getById(comment.authorId));
	children$: Observable<Comment[]> = this.comment$
		.flatMap(comment => Observable.combineLatest(...comment.children.map(child => this.commentsService.getById(child))));

	loggedInUser: User | null = null;
	loggedInUser$: Observable<User> = this.loginService.currentUser()
		.flatMap(user => user === null ? Observable.empty() : Observable.of(user));

	showChildren = false;
	showReplyBox = false;

	constructor(private commentsService: CommentService,
				private loginService: LogInService,
				private navigationService: NavigationService,
				private confirmationDialogService: ConfirmationDialogService,
				private dialogService: MdDialog,
				private changeDetectorRef: ChangeDetectorRef,
				private router: Router,
				private userService: UserService) {
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
	 *
	 * @param commentText
	 * @param parentCommentId
	 */
	addComment(commentText: string, parentCommentId: number) {
		this.onAddComment.emit({commentText, parentCommentId});
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
					this.changeDetectorRef.detectChanges();
					return this.commentsService.modify(newComment, this.parentId);
				}
				//otherwise, the user clicked close/cancel
				return Observable.empty()
			})
			.subscribe(response => {
					//todo
					console.log(response);
				},
				error => {
					console.error(error);
				})
	}

	/**
	 *
	 */
	deleteComment() {
		this.confirmationDialogService.openDialog(
			"Möchtest du diesen Kommentar wirklich löschen?"
		).subscribe(accepted => {
			if (accepted) {
				this.onDelete.emit({comment: this._comment$.value, parentId: this.parentId});
			}
		})
	}

	/**
	 *
	 * @param {Comment} comment
	 * @param parentId
	 */
	deleteChildComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.onDelete.emit({comment, parentId});
	}
}

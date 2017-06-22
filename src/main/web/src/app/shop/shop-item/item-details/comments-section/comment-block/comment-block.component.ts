import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Comment} from "../../../../shared/model/comment";
import {CommentService} from "../../../../../shared/services/comment.service";
import {Observable} from "rxjs/Observable";
import {User} from "../../../../../shared/model/user";
import {UserService} from "../../../../../shared/services/user.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {LogInService} from "../../../../../shared/services/login.service";
import {NavigationService} from "../../../../../shared/services/navigation.service";
import {Router} from "@angular/router";

@Component({
	selector: "memo-comment-block",
	templateUrl: "./comment-block.component.html",
	styleUrls: ["./comment-block.component.scss"]
})
export class CommentBlockComponent implements OnInit {
	_comment$ = new BehaviorSubject<Comment>(null);
	comment$ = this._comment$.asObservable()
		.filter(comment => comment !== null);


	@Input() set comment(comment: Comment) {
		this._comment$.next(comment);
	}

	@Output() onAddComment = new EventEmitter<{commentText: string, parentCommentId:number}>();

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
	replyToComment(parent:Comment) {
		if (this.loginService.isLoggedIn()) {
			if(parent.children && parent.children.length > 0){
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
	editComment() {
		console.log("edit");
	}

	/**
	 *
	 */
	deleteComment() {
		console.log("delete");
	}
}

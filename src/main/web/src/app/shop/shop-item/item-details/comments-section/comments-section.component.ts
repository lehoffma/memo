import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Comment} from "../../../shared/model/comment";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {LogInService} from "../../../../shared/services/login.service";
import {Observable} from "rxjs/Observable";
import {CommentService} from "../../../../shared/services/comment.service";

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
	@Output() onAddComment = new EventEmitter<{commentText:string, parentId:number}>();
	readonly DEFAULT_AMOUNT_OF_COMMENTS_SHOWN = 3;
	amountOfCommentsShown = 3;

	loggedInUser$ = this.loginService.currentUser()
		.flatMap(user => user === null ? Observable.empty() : Observable.of(user));

	expandState = false;

	constructor(private loginService: LogInService) {
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param commentText
	 * @param parentId
	 */
	addComment(commentText:string, parentId:number){
		this.onAddComment.emit({commentText, parentId});
	}
}

import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {LeaderboardRow} from "./leaderboard-row";

@Component({
	selector: "memo-miles-leaderboard-entry",
	template: `
		<a routerLink="/members/{{user.id}}"
		   *ngIf="user; else dummy"
		   [ngClass]="{'logged-in-user': loggedInUser === user.id}"
		   class="leaderboard-entry position-{{user.position}}">
			<div>
				<h2>
					<svg style="width:24px;height:24px" viewBox="0 0 24 24" *ngIf="user.position <= 3">
						<path fill="#000000"
							  d="M5,16L3,5L8.5,12L12,5L15.5,12L21,5L19,16H5M19,19A1,1 0 0,1 18,20H6A1,1 0 0,1 5,19V18H19V19Z">
						</path>
					</svg>
					{{user.position}}
				</h2>
				<!--<img src="{{user.images[0]}}">-->
				<span class="user-name">{{user.firstName}} {{user.surname}}</span>
			</div>
			<span class="miles-container">
				<span>{{user.miles}}</span>
				<span>{{user?.miles === 1 ? 'Meile' : 'Meilen'}}</span>
			</span>
		</a>
		<ng-template #dummy>
			<div class="dummy-leaderboard-entry" (click)="showMore()">
				...
			</div>
		</ng-template>
	`,
	styleUrls: ["./miles-leaderboard-entry.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class MilesLeaderboardEntryComponent implements OnInit {
	@Input() user: LeaderboardRow;

	@Input() loggedInUser: number;
	@Output() onShowMore = new EventEmitter();

	constructor() {
	}

	ngOnInit() {
	}

	showMore() {
		this.onShowMore.emit(true)
	}
}

import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";
import {UserService} from "../../../services/api/user.service";
import {EMPTY} from "rxjs";
import {User} from "../../../model/user";
import {Observable} from "rxjs";

@Component({
	selector: "td [memoProfileLinkCellComponent]",
	template: `
		<a *ngIf="user$ | async; let user" routerLink="/members/{{user.id}}" mat-button color="accent">
			<mat-icon>person</mat-icon>
			<span class="action-text">Profil anzeigen</span>
		</a>
	`,
	styles: [`
		:host {
			width: 100%;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	`]
})

export class ProfileLinkCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: number;
	user$: Observable<User> = EMPTY;

	constructor(private userService: UserService) {
	}

	ngOnInit() {
		this.user$ = this.userService.getById(this.data);
	}
}

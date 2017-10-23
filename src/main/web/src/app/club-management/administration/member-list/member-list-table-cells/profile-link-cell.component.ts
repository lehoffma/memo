import {Component, Input, OnInit} from '@angular/core';
import {ExpandableTableCellComponent} from "../../../../shared/expandable-table/expandable-table-cell.component";
import {UserService} from "../../../../shared/services/api/user.service";
import {Observable} from "rxjs/Rx";

@Component({
	selector: 'td [memoProfileLinkCellComponent]',
	template: `
		<a *ngIf="user$ | async; let user" routerLink="/members/{{user.id}}" mat-button color="accent">
			<mat-icon>person</mat-icon>
			<span class="action-text">Profil anzeigen</span>
		</a>
	`,
	styles: [`
		:host{
			width: 100%;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	`]
})

export class ProfileLinkCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: number;
	user$ = Observable.empty();

	constructor(private userService: UserService) {
	}

	ngOnInit() {
		this.user$ = this.userService.getById(this.data);
	}
}

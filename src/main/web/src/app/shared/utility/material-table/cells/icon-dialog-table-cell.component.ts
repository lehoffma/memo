import {Component, Inject, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";

@Component({
	selector: "memo-icon-cell-details-dialog",
	template: `
		<h3 mat-dialog-title>{{data.title || 'Details'}}</h3>
		<mat-dialog-content>
			{{data.body}}
		</mat-dialog-content>
		<mat-dialog-actions>
			<button mat-button mat-dialog-close>Schließen</button>
		</mat-dialog-actions>
	`,
	styles: [`

	`]
})
export class IconCellDetailsDialog {
	constructor(private dialogRef: MatDialogRef<IconCellDetailsDialog>,
				@Inject(MAT_DIALOG_DATA) public data: { title?: string; body: string; }) {

	}
}

@Component({
	selector: "memo-icon-dialog-table-cell",
	template: `
		<memo-picture-table-cell *ngIf="data.images" [data]="data.images"></memo-picture-table-cell>
		<span *ngIf="data.text">{{data.text}}</span>
		<mat-icon *ngIf="data.details"
				  (click)="open()"
				  matTooltip="{{data.tooltip || 'Klick für mehr Details'}}">{{data.icon}}</mat-icon>
	`,
	styleUrls: ["./icon-dialog-table-cell.component.scss"]
})
export class IconDialogTableCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: {
		text: string;
		icon: string;
		images?: string[];
		details: string;
		dialogTitle?: string;
		tooltip?: string;
	};

	constructor(private matDialog: MatDialog) {
	}

	ngOnInit() {
	}

	private open() {
		this.matDialog.open(IconCellDetailsDialog, {
			data: {
				title: this.data.dialogTitle,
				body: this.data.details
			}
		})
	}
}

import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
	selector: "td [memoEmailTableCellComponent], memo-email-table-cell",
	template: `
		<span class="action-text">{{data}}</span>
		<a [href]="sanitizedEmail" mat-button color="accent">
			<div>
				<mat-icon>email</mat-icon>
				<span class="icon-text">Kontaktieren</span>
			</div>
		</a>
	`,
	styleUrls: ["./email-table-cell.component.scss"]
})

export class EmailTableCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: string;
	sanitizedEmail;

	constructor(private sanitizer: DomSanitizer) {

	}

	ngOnInit() {
		this.sanitizedEmail = this.sanitizer.bypassSecurityTrustResourceUrl("email:" + this.data);
	}
}

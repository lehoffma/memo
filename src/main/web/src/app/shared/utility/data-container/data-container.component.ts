import {Component, Input, OnInit, TemplateRef} from "@angular/core";

@Component({
	selector: "memo-data-error-state-actions",
	template: `<ng-content></ng-content>`,
	styles: [``]
})
export class DataContainerErrorStateActions{

}

@Component({
	selector: "memo-data-empty-state-actions",
	template: `<ng-content></ng-content>`,
	styles: [``]
})
export class DataContainerEmptyStateActions{

}

@Component({
	selector: "memo-data-container",
	templateUrl: "./data-container.component.html",
	styleUrls: ["./data-container.component.scss"]
})
export class DataContainerComponent implements OnInit {
	@Input() data: any[] = null;
	@Input() loading: boolean;
	@Input() error: any;

	@Input() errorStateIcon: string;
	@Input() errorStateHeadline: string;
	@Input() errorStateSubtitle: string;

	@Input() emptyStateIcon: string;
	@Input() emptyStateHeadline: string;
	@Input() emptyStateSubtitle: string;

	@Input() renderer: TemplateRef<any>;

	constructor() {
	}

	ngOnInit() {
	}

}
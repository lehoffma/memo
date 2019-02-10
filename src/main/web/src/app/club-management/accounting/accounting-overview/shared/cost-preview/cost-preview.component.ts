import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "a [memoCostPreview]",
	templateUrl: "./cost-preview.component.html",
	styleUrls: ["./cost-preview.component.scss"]
})
export class CostPreviewComponent implements OnInit {
	@Input() label: string;
	@Input() totalBalance: number;

	constructor() {
	}

	ngOnInit() {
	}

}

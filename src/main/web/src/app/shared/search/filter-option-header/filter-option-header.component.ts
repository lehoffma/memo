import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
	selector: "memo-filter-option-header",
	templateUrl: "./filter-option-header.component.html",
	styleUrls: ["./filter-option-header.component.scss"]
})
export class FilterOptionHeaderComponent implements OnInit {
	@Input() title;
	@Input() withReset: boolean = false;
	@Output() onReset =  new EventEmitter();

	constructor() {
	}

	ngOnInit() {
	}

}

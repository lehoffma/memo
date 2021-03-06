import {Component, ContentChild, Input, OnInit} from "@angular/core";
import {trigger} from "@angular/animations";
import {ShopEvent} from "../../shared/model/event";
import {ExpandableMaterialTableEmptyStateActions} from "../../../shared/utility/material-table/expandable-material-table.component";

@Component({
	selector: "memo-results-empty-state",
	template: "<ng-content></ng-content>"
})
export class ResultsEmptyStateComponent{

}

@Component({
	selector: "memo-results",
	templateUrl: "./results.component.html",
	styleUrls: ["./results.component.scss"],
	animations: [
		//todo
		trigger("flyInFadeOut", [
			// state("1", style({transform: "translateX(0)"})),
			// transition("* => *", [
			// 	query(":enter", [
			// 		style({transform: "translateX(-100%)"}),
			// 		stagger(100, [
			// 			animate('200ms ease-out'),
			// 		])
			// 	], {optional: true}),
			// 	query(":leave", [
			// 		stagger(100, [
			// 			animate("200ms ease-in", style({transform: "translateX(-100%)"}))
			// 		])
			// 	], {optional: true})
			// ])
		])
	]
})
export class ResultsComponent implements OnInit {
	@Input() events: ShopEvent[];

	@ContentChild(ResultsEmptyStateComponent, {static: true}) customEmptyState: ResultsEmptyStateComponent;

	constructor() {
	}

	ngOnInit() {
	}

}

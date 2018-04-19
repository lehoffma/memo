import {Directive, ViewContainerRef} from "@angular/core";

@Directive({
	selector: "[memoExpandedTableRowContainer]"
})
export class ExpandedTableRowContainerDirective {
	constructor(public viewContainerRef: ViewContainerRef) {
	}
}

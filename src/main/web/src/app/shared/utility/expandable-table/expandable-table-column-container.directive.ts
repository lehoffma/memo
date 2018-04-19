import {Directive, ViewContainerRef} from "@angular/core";

@Directive({
	selector: "[memoExpandableTableColumnContainer]"
})
export class ExpandableTableColumnContainerDirective {

	constructor(public viewContainerRef: ViewContainerRef) {
	}

}

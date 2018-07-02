import {Directive, ElementRef, Input} from "@angular/core";

@Directive({
	selector: "[memoSpiedOnElement]"
})
export class SpiedOnElementDirective {
	@Input("memoSpiedOnElement") id: string;

	constructor(public elementRef: ElementRef) {
	}

}

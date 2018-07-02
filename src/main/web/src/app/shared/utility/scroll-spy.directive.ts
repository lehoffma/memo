import {Directive, ElementRef, EventEmitter, Input, OnDestroy, Output} from "@angular/core";
import {ScrollingService} from "../services/scrolling.service";
import {debounceTime, takeUntil} from "rxjs/operators";
import {CdkScrollable} from "@angular/cdk/overlay";
import {SpiedOnElementDirective} from "./spied-on-element.directive";

@Directive({
	selector: "[memoScrollSpy]"
})
export class ScrollSpyDirective implements OnDestroy {
	sortedElements: SpiedOnElementDirective[];
	@Output() currentSectionChange: EventEmitter<SpiedOnElementDirective> = new EventEmitter<SpiedOnElementDirective>();
	private onDestroy: EventEmitter<any> = new EventEmitter<any>();

	constructor(private element: ElementRef,
				private scrollingService: ScrollingService) {
		this.scrollingService.scroll.pipe(debounceTime(15), takeUntil(this.onDestroy)).subscribe(
			it => this.onScroll(it)
		)
	}

	_spyOn: SpiedOnElementDirective[];

	@Input() set spyOn(spyOn: SpiedOnElementDirective[]) {
		if (!spyOn) {
			return;
		}

		this.sortedElements = [...spyOn]
			.filter(it => it !== undefined)
			.filter(it => it.elementRef.nativeElement.offsetTop !== undefined)
			.sort((a: SpiedOnElementDirective, b: SpiedOnElementDirective) =>
				b.elementRef.nativeElement.offsetTop - a.elementRef.nativeElement.offsetTop);
		this._spyOn = spyOn;
	}

	onScroll(it: CdkScrollable) {
		const elements = this.sortedElements;
		//0, 200, 400, 600
		//scrolltop = 150 => 0 is selected =>

		let activeItem: SpiedOnElementDirective | null = null;
		elements.some(element => {
			const top = element.elementRef.nativeElement.offsetTop;
			if (top <= (this.scrollingService.scrollTop + 20)) {
				activeItem = element;
				return true;
			}
			return false;
		});
		this.currentSectionChange.emit(activeItem);
	}

	ngOnDestroy(): void {
		this.onDestroy.next();
	}


}

import {Injectable} from "@angular/core";
import {CdkScrollable, ScrollDispatcher} from "@angular/cdk/scrolling";
import {Observable, Subject, Subscription} from "rxjs";
import {tap} from "rxjs/operators";

@Injectable()
export class ScrollingService {
	private _scroll: Subject<CdkScrollable> = new Subject<CdkScrollable>();
	scroll: Observable<CdkScrollable> = this._scroll.asObservable();
	private _subscription: Subscription;

	constructor(private scrollDispatcher: ScrollDispatcher) {
		this._subscription = this.scrollDispatcher.scrolled()
			.pipe(
				tap(event => {
					if (event instanceof CdkScrollable) {
						const elementRef = event.getElementRef();
						if (elementRef.nativeElement.scrollTop !== undefined) {
							this._scrollTop = elementRef.nativeElement.scrollTop
						}
					}
				})
			)
			.subscribe(this._scroll);
	}

	private _scrollTop = 0;

	get scrollTop() {
		return this._scrollTop;
	}

	scrollToTop(){
		document.querySelector('.mat-sidenav-content').scrollTop = 0;
	}
}

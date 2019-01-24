import {Inject, Injectable, PLATFORM_ID} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {Optional} from "../utility/optional";
import {isPlatformBrowser} from "@angular/common";
import {map} from "rxjs/operators";

function getWindow(): Window {
	return window;
}

export interface Dimension {
	width: number;
	height: number;
}

@Injectable()
export class WindowService {
	private _dimensions$: BehaviorSubject<{ width: number, height: number }> = new BehaviorSubject({
		width: this.window.map(it => it.innerWidth).orElse(0),
		height: this.window.map(it => it.innerHeight).orElse(0)
	});
	dimension$ = this._dimensions$.asObservable();

	constructor(@Inject(PLATFORM_ID) private platformId: Object) {
		this.window.ifPresent(it => it.addEventListener("resize", ev => {
			this._dimensions$.next({
				width: this.window.map(it => it.innerWidth).orElse(0),
				height: this.window.map(it => it.innerHeight).orElse(0)
			});
		}));
	}

	get window(): Optional<Window> {
		if (isPlatformBrowser(this.platformId)) {
			// Client only code.
			return Optional.of(getWindow());
		}
		return Optional.empty();
	}

	get dimensions() {
		return {
			width: this._dimensions$.getValue().width,
			height: this._dimensions$.getValue().height
		};
	}

	hasMinDimensions(width?: number, height?: number): Observable<boolean>{
		return this._dimensions$.pipe(
			map(dimensions => {
				let hasMinDimensions = true;
				if(width){
					hasMinDimensions = hasMinDimensions && dimensions.width >= width;
				}
				if(height){
					hasMinDimensions = hasMinDimensions && dimensions.height >= height;
				}
				return hasMinDimensions;
			})
		)
	}

	isTouchDevice() {
		return "ontouchstart" in this.window.orElse({} as any)   // works on most browsers
			|| navigator.maxTouchPoints;       // works on IE10/11 and Surface
	};

}

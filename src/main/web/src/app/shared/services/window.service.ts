import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs/Rx";

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
		width: this.window.innerWidth,
		height: this.window.innerHeight
	});
	dimension$ = this._dimensions$.asObservable();

	constructor() {
		this.window.addEventListener("resize", ev => {
			this._dimensions$.next({
				width: this.window.innerWidth,
				height: this.window.innerHeight
			});
		})
	}

	get window(): Window {
		return getWindow();
	}

	isTouchDevice() {
		return "ontouchstart" in this.window   // works on most browsers
			|| navigator.maxTouchPoints;       // works on IE10/11 and Surface
	};

}

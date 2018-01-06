import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {CapacityRendererText} from "./capacity-renderer-text";
import {defaultIfEmpty, map} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {CapacityRendererColoring} from "./capacity-renderer-coloring";


@Component({
	selector: 'memo-capacity-renderer',
	templateUrl: './capacity-renderer.component.html',
	styleUrls: ['./capacity-renderer.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CapacityRendererComponent implements OnInit {

	@Input() icon: string;

	_maxAmount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);


	@Input() set maxAmount(available: number) {
		this._maxAmount$.next(available);
	};

	get maxAmount() {
		return this._maxAmount$.getValue();
	}

	_available$ = new BehaviorSubject<number>(0);
	@Input() set available(available: number){
		this._available$.next(available);
	}


	_textOptions$: BehaviorSubject<CapacityRendererText> = new BehaviorSubject<CapacityRendererText>({
		singular: "",
		plural: ""
	});

	@Input() set textOptions(text: CapacityRendererText) {
		this._textOptions$.next(text);
	}

	get textOptions() {
		return this._textOptions$.getValue();
	}

	_coloring$: BehaviorSubject<CapacityRendererColoring> = new BehaviorSubject<CapacityRendererColoring>({
		red: 0,
		yellow: 0.01,
		green: 1
	});

	@Input() set coloring(coloring: CapacityRendererColoring) {
		this._coloring$.next(coloring);
	}

	get coloring() {
		return this._coloring$.getValue();
	}

	currentText$ = combineLatest(
		this._maxAmount$,
		this._textOptions$
	)
		.pipe(
			map(([available, options]) => available !== -1 ? options.plural : options.singular)
		);


	currentColor$ = combineLatest(
		this._available$,
		this._maxAmount$,
		this._coloring$
	)
		.pipe(
			map(([available, maxAmount, colors]) => {
				const percentage = available / maxAmount;
				if (percentage >= colors.green) {
					return "green";
				}
				if (percentage >= colors.yellow) {
					return "yellow";
				}
				if (percentage >= colors.red) {
					return "red";
				}
			}),
			defaultIfEmpty("red")
		);

	constructor() {
	}

	ngOnInit() {
	}

}

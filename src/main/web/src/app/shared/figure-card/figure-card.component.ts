import {ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output} from "@angular/core";

@Component({
	selector: "memo-figure-card",
	templateUrl: "./figure-card.component.html",
	styleUrls: ["./figure-card.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		"class": "mat-elevation-z3"
	}
})
export class FigureCardComponent implements OnInit {
	@Input() icon: string;
	@Input() titleValue: string;
	@Input() titleLabel: string;
	@Input() subtitle: string;

	@HostBinding("class.selectable")
	_selectable = true;
	@Input() set selectable(selectable: boolean) {
		this._selectable = selectable;
	}

	get selectable() {
		return this._selectable;
	}

	@HostBinding("class.selected")
	_selected = false;

	get selected() {
		return this._selected;
	}

	@Input() set selected(selected: boolean) {
		this._selected = selected;
	}

	@Output() onSelect = new EventEmitter();

	constructor() {
	}

	ngOnInit() {
	}

	@HostListener("click")
	click() {
		if (this.selectable) {
			this.onSelect.emit(true);
		}
	}

}

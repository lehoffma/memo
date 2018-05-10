import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";
import {MerchColor} from "../../../../shop/shared/model/merch-color";

@Component({
	selector: "td [memoMerchColorCell], memo-merch-color-cell",
	template: `
		<span class="mat-elevation-z2"
			  [style.background-color]="data.hex"
			  [style.color]="textColor"
		>{{data.name}}</span>
	`,
	styles: [`
		span {
			padding: 0.5rem;
			white-space: nowrap;
		}
	`]
})
export class MerchColorCellComponent implements OnInit, OnChanges, ExpandableTableCellComponent {
	@Input() data: MerchColor;
	textColor: string = "black";

	constructor() {
	}

	ngOnInit() {
		this.textColor = this.getColor(this.hexToRgb(this.data.hex));
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["data"]) {
			this.textColor = this.getColor(this.hexToRgb(this.data.hex));
		}
	}

	hexToRgb(hex: string) {
		hex = hex.replace(/^#/, "");

		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}

		const num = parseInt(hex, 16);

		return [num >> 16, num >> 8 & 255, num & 255];
	}

	getColor(rgb: number[]): string {
		const value = Math.round(((rgb[0] * 299) +
			(rgb[1] * 587) +
			(rgb[2] * 114)) / 1000);
		return (value > 125) ? "black" : "white";
	}
}

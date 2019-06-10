import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA} from "@angular/material";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {MerchColor} from "../../../../shared/model/merch-color";


export interface AddColorDialogOptions {
	previousValue?: MerchColor;
	formGroup: FormGroup;
}


@Component({
	selector: "memo-add-color-dialog",
	templateUrl: "./add-color-dialog.component.html",
	styleUrls: ["./add-color-dialog.component.scss"]
})
export class AddColorDialogComponent implements OnDestroy {

	public textColor: string = "white";

	onDestroy$ = new Subject();
	constructor(@Inject(MAT_DIALOG_DATA) public data: AddColorDialogOptions) {

		this.data.formGroup.get("hex").valueChanges
			.pipe(takeUntil(this.onDestroy$))
			.subscribe(value => this.updateTextColor(value));
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

	updateTextColor(hex: string) {
		const rgb = this.hexToRgb(hex);
		this.textColor = this.colorIsLight(rgb.r, rgb.g, rgb.b) ? "black" : "white";
	}

	private hexToRgb(hex: string): { r: number, g: number, b: number } {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, (m, red, green, blue) => {
			return red + red + green + green + blue + blue;
		});

		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	private colorIsLight(red: number, green: number, blue: number) {
		// Counting the perceptive luminance
		// human eye favors green color...
		const a = 1 - (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
		return (a < 0.5);
	}

}

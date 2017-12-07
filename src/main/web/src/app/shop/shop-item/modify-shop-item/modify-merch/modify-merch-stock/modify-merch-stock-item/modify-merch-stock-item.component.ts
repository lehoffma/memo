import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ModifyType} from "../../../modify-type";
import {StockService} from "../../../../../../shared/services/api/stock.service";

@Component({
	selector: "memo-modify-merch-stock-item",
	templateUrl: "./modify-merch-stock-item.component.html",
	styleUrls: ["./modify-merch-stock-item.component.scss"]
})
export class ModifyMerchStockItemComponent implements OnInit {
	public availableSizes = [];

	public newSize = "";
	public model: {
		[size: string]: number
	} = {};
	public readonly availableAmounts = Array.from(Array(101).keys());

	public color: string = "#ff0000";
	public textColor: string = "white";
	public colorName: string;

	constructor(private dialogRef: MatDialogRef<ModifyMerchStockItemComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any) {
	}


	addSize(size: string) {
		this.newSize = "";
		this.availableSizes.push(size);
		this.model[size] = 0;
	}


	get isEditing() {
		return this.data && this.data.color && this.data.color.hex && this.data.color.name;
	}

	ngOnInit() {
		if (this.isEditing) {
			this.availableSizes = [this.data.size];
			this.model[this.data.size] = this.data.amount;
			this.color = this.data.color.hex;
			this.colorName = this.data.color.name;
		}
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

	updateTextColor() {
		const rgb = this.hexToRgb(this.color);
		this.textColor = this.colorIsLight(rgb.r, rgb.g, rgb.b) ? "black" : "white";
	}

	emitDoneEvent() {
		let modifyType: ModifyType = this.isEditing ? ModifyType.EDIT : ModifyType.ADD;
		let modifiedStock: number = this.isEditing ? this.data.modifiedStock : null;
		this.dialogRef.close({
			event: this.data.event,
			color: {hex: this.color, name: this.colorName},
			sizes: this.model,
			modifyType,
			modifiedStock
		});
	}
}

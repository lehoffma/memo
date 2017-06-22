import {Component, Inject, OnInit} from "@angular/core";
import {MD_DIALOG_DATA, MdDialogRef} from "@angular/material";
import {ModifyType} from "../../../modify-type";

@Component({
	selector: "memo-modify-merch-stock-item",
	templateUrl: "./modify-merch-stock-item.component.html",
	styleUrls: ["./modify-merch-stock-item.component.scss"]
})
export class ModifyMerchStockItemComponent implements OnInit {
	public size: string;
	public color: string = "#ff0000";
	public colorName: string;
	public amount: number;

	constructor(private dialogRef: MdDialogRef<ModifyMerchStockItemComponent>,
				@Inject(MD_DIALOG_DATA) public data: any) {
	}

	get isEditing() {
		return this.data && this.data.color && this.data.color.hex && this.data.color.name;
	}

	ngOnInit() {
		if (this.isEditing) {
			this.size = this.data.size;
			this.amount = this.data.amount;
			this.color = this.data.color.hex;
			this.colorName = this.data.color.name;
		}
	}

	emitDoneEvent() {
		let modifyType: ModifyType = this.isEditing ? ModifyType.EDIT : ModifyType.ADD;
		let modifiedStock: number = this.isEditing ? this.data.modifiedStock : null;
		this.dialogRef.close({
			size: this.size,
			color: {hex: this.color, name: this.colorName},
			amount: this.amount,
			modifyType,
			modifiedStock
		});
	}
}

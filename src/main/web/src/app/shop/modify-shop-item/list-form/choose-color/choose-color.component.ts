import {Component, Inject, OnInit} from "@angular/core";
import {MD_DIALOG_DATA, MdDialogRef} from "@angular/material";
import {ModifyType} from "../../modify-type";

@Component({
	selector: "memo-choose-color",
	templateUrl: "./choose-color.component.html",
	styleUrls: ["./choose-color.component.scss"]
})
export class ChooseColorComponent implements OnInit {
	public color: string = "#ff0000";
	public colorName: string;

	constructor(private dialogRef: MdDialogRef<ChooseColorComponent>,
				@Inject(MD_DIALOG_DATA) public data: any) {
	}

	get isEditing() {
		return this.data && this.data.color && this.data.color.hex && this.data.color.name;
	}

	ngOnInit() {
		if (this.isEditing) {
			this.color = this.data.color.hex;
			this.colorName = this.data.color.name;
		}
	}

	removeObjectFromList() {
		this.dialogRef.close({color: {hex: this.color, name: this.colorName}, listAction: ModifyType.REMOVE});
	}

	emitDoneEvent() {
		let listAction: ModifyType = this.isEditing ? ModifyType.EDIT : ModifyType.ADD;
		this.dialogRef.close({color: {hex: this.color, name: this.colorName}, listAction});
	}
}

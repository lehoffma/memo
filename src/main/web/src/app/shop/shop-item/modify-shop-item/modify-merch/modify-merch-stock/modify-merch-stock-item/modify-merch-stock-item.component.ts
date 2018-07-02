import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ModifyType} from "../../../modify-type";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {noDuplicatesValidator} from "../../../../../../shared/validators/no-duplicates.validator";
import {minChildrenValidator} from "../../../../../../shared/validators/min-children.validator";

@Component({
	selector: "memo-modify-merch-stock-item",
	templateUrl: "./modify-merch-stock-item.component.html",
	styleUrls: ["./modify-merch-stock-item.component.scss"]
})
export class ModifyMerchStockItemComponent implements OnInit, OnDestroy {
	public formGroup: FormGroup;
	public addSizeFormGroup: FormGroup;

	public availableSizes = [];
	public readonly availableAmounts = Array.from(Array(101).keys()).map(it => it);

	public textColor: string = "white";

	subscriptions = [];

	constructor(private dialogRef: MatDialogRef<ModifyMerchStockItemComponent>,
				private formBuilder: FormBuilder,
				@Inject(MAT_DIALOG_DATA) public data: any) {
		this.formGroup = this.formBuilder.group({
			"color": this.formBuilder.group({
				"hex": ["#ff0000", {
					validators: [Validators.required]
				}],
				"name": ["", {
					validators: [Validators.required]
				}]
			}),
			"sizes": this.formBuilder.group({})
		});


		this.addSizeFormGroup = this.formBuilder.group({
			"size": ["", {
				validators: [noDuplicatesValidator(this.availableSizes)]
			}]
		});

		this.subscriptions.push(
			this.formGroup.get("color").get("hex").valueChanges
				.subscribe(value => this.updateTextColor(value)),
		)
	}

	get isEditing() {
		return this.data && this.data.color && this.data.color.hex && this.data.color.name;
	}

	ngOnInit() {
		this.formGroup.get("sizes").setValidators([minChildrenValidator(1)]);
		if (this.isEditing) {
			this.availableSizes = [this.data.size];
			(this.formGroup.get("sizes") as FormGroup)
				.addControl(this.data.size, this.formBuilder.control(this.data.amount));

			this.formGroup.get("color").setValue({
				hex: this.data.color.hex,
				name: this.data.color.name
			});
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}


	addSize(size: string) {
		(this.formGroup.get("sizes") as FormGroup).addControl(size, this.formBuilder.control(1));
		this.addSizeFormGroup.patchValue({size: ""});
		this.availableSizes.push(size);
		this.addSizeFormGroup.get("size").setValidators([noDuplicatesValidator(this.availableSizes)]);
	}

	deleteSize(size: string, index: number) {
		(this.formGroup.get("sizes") as FormGroup).removeControl(size);
		this.availableSizes.splice(index, 1);
	}

	updateTextColor(hex: string) {
		const rgb = this.hexToRgb(hex);
		this.textColor = this.colorIsLight(rgb.r, rgb.g, rgb.b) ? "black" : "white";
	}

	emitDoneEvent() {
		let modifyType: ModifyType = this.isEditing ? ModifyType.EDIT : ModifyType.ADD;
		let modifiedStock: number = this.isEditing ? this.data.modifiedStock : null;
		this.dialogRef.close({
			event: this.data.event,
			color: this.formGroup.get("color").value,
			sizes: this.formGroup.get("sizes").value,
			modifyType,
			modifiedStock
		});
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

import {ChangeDetectionStrategy, Component, Inject, OnInit} from "@angular/core";
import {FormBuilder, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
	selector: "memo-name-change-dialog",
	templateUrl: "./name-change-dialog.component.html",
	styleUrls: ["./name-change-dialog.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NameChangeDialogComponent implements OnInit {

	formGroup = this.fb.group({
		name: this.fb.control("", {validators: [Validators.required]})
	});

	constructor(private fb: FormBuilder,
				@Inject(MAT_DIALOG_DATA) public data: {
					name?: string;
				}
	) {
		if (this.data && this.data.name) {
			this.formGroup.get("name").setValue(this.data.name);
		}
	}

	ngOnInit() {
	}

}

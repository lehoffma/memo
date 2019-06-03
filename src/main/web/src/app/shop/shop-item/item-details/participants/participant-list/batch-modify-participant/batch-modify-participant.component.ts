import {Component, Inject, OnInit, TemplateRef} from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import {AbstractControl} from "@angular/forms";

export interface BatchModifyParticipantOptions {
	label: string;
	subtitle: string;
	formControl: AbstractControl;
	formField: TemplateRef<any>;
	withFormLabel?: boolean;
}

@Component({
	selector: "memo-batch-modify-participant",
	templateUrl: "./batch-modify-participant.component.html",
	styleUrls: ["./batch-modify-participant.component.scss"]
})
export class BatchModifyParticipantComponent implements OnInit {

	constructor(@Inject(MAT_DIALOG_DATA) public data: BatchModifyParticipantOptions) {
	}

	ngOnInit() {
	}

}

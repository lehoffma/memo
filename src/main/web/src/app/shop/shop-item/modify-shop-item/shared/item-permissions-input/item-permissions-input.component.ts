import {Component, Input, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {ClubRole, clubRoles} from "../../../../../shared/model/club-role";
import {Subscription} from "rxjs/Subscription";

export interface PermissionInput {
	key: string;
	label: string;
}

@Component({
	selector: "memo-item-permissions-input",
	templateUrl: "./item-permissions-input.component.html",
	styleUrls: ["./item-permissions-input.component.scss"]
})
export class ItemPermissionsInputComponent implements OnInit {
	@Input() formGroup: FormGroup;
	clubRoleOptions = clubRoles();

	@Input() set previousValue(previousValue: { [p: string]: ClubRole }) {
		Object.keys(previousValue)
			.filter(key => !!previousValue[key])
			.forEach(key => {
				if (this.formGroup.get(key) !== null) {
					this.formGroup.get(key).patchValue(previousValue[key]);
				}
			})
	}

	permissions: PermissionInput[] = [{
		key: "expectedReadRole",
		label: "Wer kann dies sehen?"
	}, {
		key: "expectedCheckInRole",
		label: "Wer kann teilnehmen?"
	}, {
		key: "expectedWriteRole",
		label: "Wer kann modifizieren?"
	}];

	subscriptions: Subscription[] = [];

	constructor() {
	}

	ngOnInit() {
	}
}

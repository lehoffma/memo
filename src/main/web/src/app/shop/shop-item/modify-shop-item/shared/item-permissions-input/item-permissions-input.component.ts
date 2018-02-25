import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
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
	permissionsInputForm: FormGroup;
	clubRoleOptions = clubRoles();

	_permissions: PermissionInput[] = [{
		key: "expectedReadRole",
		label: "Wer kann dies sehen?"
	}, {
		key: "expectedCheckInRole",
		label: "Wer kann teilnehmen?"
	}, {
		key: "expectedWriteRole",
		label: "Wer kann modifizieren?"
	}];

	_values: { [p: string]: ClubRole };
	@Input() set values(permissionMap: { [p: string]: ClubRole }) {
		this._values = permissionMap;
		this.updateForm();
	}

	get values() {
		return this._values;
	}

	@Input() set permissions(permissions: PermissionInput[]) {
		const hasChanged = permissions.some(value => !this._permissions.includes(value)) ||
			this._permissions.some(value => !permissions.includes(value));
		this._permissions = [...permissions];
		if (hasChanged) {
			this.updateForm();
		}
	}

	get permissions() {
		return this._permissions;
	}

	@Output() onChange: EventEmitter<{
		[p: string]: ClubRole
	}> = new EventEmitter<{ [p: string]: ClubRole }>();

	subscriptions: Subscription[] = [];

	constructor(private fb: FormBuilder) {
		this.updateForm();
	}

	ngOnInit() {
	}

	updateForm() {
		const controlsConfig = this.permissions
			.map(it => it.key)
			.reduce((config, permissionKey) => {
				const initValue = (this.values && this.values[permissionKey]) || ClubRole.None;
				config[permissionKey] = this.fb.control(initValue);
				return config;
			}, {});
		this.permissionsInputForm = this.fb.group(controlsConfig);
		this.subscriptions.forEach(it => it.unsubscribe());
		this.subscriptions = this.permissions
			.map(it => it.key)
			.map(key => this.permissionsInputForm
				.get(key)
				.valueChanges
				.subscribe(value => this.onChange.emit(this.getValuesAsMap()))
			)
	}

	getValuesAsMap(): { [key: string]: ClubRole } {
		return this.permissions
			.map(it => it.key)
			.reduce((map, permissionKey) => {
				map[permissionKey] = this.permissionsInputForm.get(permissionKey).value;
				return map;
			}, {})
	}
}

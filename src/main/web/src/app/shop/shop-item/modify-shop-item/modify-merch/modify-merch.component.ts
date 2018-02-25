import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {ModifyItemEvent} from "../modify-item-event";
import {User} from "../../../../shared/model/user";
import {ClubRole} from "../../../../shared/model/club-role";

@Component({
	selector: "memo-modify-merch",
	templateUrl: "./modify-merch.component.html",
	styleUrls: ["./modify-merch.component.scss"]
})
export class ModifyMerchComponent implements OnInit {
	@Input() model: any = {stock: []};
	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<ModifyItemEvent> = new EventEmitter();

	ModifyType = ModifyType;
	priceIsValid = true;
	uploadedImage: FormData;
	defaultImageUrl = "resources/images/Logo.png";

	constructor(private location: Location) {
	}

	get merchModel() {
		return this.model;
	}

	set merchModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
	}


	get permissions(): { [p: string]: ClubRole } {
		const permissions: { [p: string]: ClubRole } = {};
		/**
		 *
		 public expectedReadRole: ClubRole,
		 public expectedCheckInRole: ClubRole,
		 public expectedWriteRole: ClubRole,
		 */
		const possiblePermissions = ["expectedReadRole", "expectedCheckInRole", "expectedWriteRole"];
		if (this.merchModel) {
			possiblePermissions
				.filter(key => !!this.merchModel[key])
				.forEach(key => {
					permissions[key] = this.merchModel[key];
				})
		}
		return permissions;
	}

	ngOnInit() {
	}

	checkValidityOfPrice() {
		this.priceIsValid = new RegExp(/^[\d]+(([.,])[\d]{1,2})?$/).test(this.merchModel["price"])
	}

	cancel() {
		this.location.back();
	}


	permissionChange(event: { [key: string]: ClubRole }) {
		Object.keys(event).forEach(permissionKey => this.model[permissionKey] = event[permissionKey]);
	}

	responsibleUsersChange(users: User[]) {
		//todo responsibility api
		console.log(users);
	}


	submitModifiedObject() {
		this.onSubmit.emit({
			model: this.model,
			uploadedImage: this.uploadedImage
		});
	}

	profilePictureChanged(event) {
		this.uploadedImage = event;
	}
}

import {Injectable} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ClubRole} from "../../../shared/model/club-role";

@Injectable({
	providedIn: "root"
})
export class AccountSettingsService {
	onSave = new Subject();
	onReset = new Subject();
	hasChanges$ = new BehaviorSubject(false);
	loading$ = new BehaviorSubject(false);

	userDataForm: FormGroup;

	constructor(private formBuilder: FormBuilder) {
		this.userDataForm = this.formBuilder.group({
			"images": this.formBuilder.group({
				"imagePaths": [[], {validators: []}],
				"imagesToUpload": [[], {validators: []}]
			}),
			"addresses": [[], {
				validators: [Validators.required]
			}],
			"club-information": this.formBuilder.group({
				"clubRole": [ClubRole.Gast, {validators: []}],
				"joinDate": [new Date(), {validators: [Validators.required]}],
			})
		});
	}

	reset() {
		this.onReset.next(true);
	}

	save() {
		this.onSave.next(true);
	}

	loading(value: boolean = !this.loading$.getValue()) {
		this.loading$.next(value);
	}
}

import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Gender} from "../../../shared/model/gender";
import {ClubRole} from "../../../shared/model/club-role";
import {LogInService} from "../../../shared/services/api/login.service";
import {AddressService} from "../../../shared/services/api/address.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../shared/services/api/user.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {emailAlreadyTakenValidator} from "../../../shared/validators/email-already-taken.validator";
import {confirmPasswordValidator} from "../../../shared/validators/confirm-password.validator";
import {User} from "../../../shared/model/user";
import {combineLatest} from "rxjs/observable/combineLatest";
import {first} from "rxjs/operators";

@Component({
	selector: "memo-user-data-form",
	templateUrl: "./user-data-form.component.html",
	styleUrls: ["./user-data-form.component.scss"]
})
export class UserDataFormComponent implements OnInit {
	userDataForm: FormGroup;

	@Output() onSubmit = new EventEmitter<any>();

	_checkEmail = false;
	@Input() set checkEmail(checkEmail: boolean) {
		this._checkEmail = checkEmail;
		if (this.userDataForm.get("account-data")) {
			if (checkEmail) {
				this.userDataForm.get("account-data").setAsyncValidators(emailAlreadyTakenValidator(this));
			}
			else {
				this.userDataForm.get("account-data").clearAsyncValidators();
			}
		}
	}

	get checkEmail() {
		return this._checkEmail;
	}

	_withEmailAndPassword = false;
	@Input() set withEmailAndPassword(value: boolean) {
		this._withEmailAndPassword = value;
		if (value) {
			this.userDataForm.addControl("account-data", this.getAccountDataFormGroup());
		}
		else {
			this.userDataForm.removeControl("account-data")
		}
	}

	get withEmailAndPassword() {
		return this._withEmailAndPassword;
	}

	_previousValue: User;
	@Input() set previousValue(previousValue: User) {
		this._previousValue = previousValue;

		if (!previousValue) {
			return;
		}

		this.userDataForm.get("account-data").patchValue({
			"email": previousValue.email
		});
		this.userDataForm.get("personal-data").patchValue({
			"firstName": previousValue.firstName,
			"surname": previousValue.surname,
			"birthday": previousValue.birthday,
			"gender": previousValue.gender,
			"phone": previousValue.telephone,
			"mobile": previousValue.mobile,
			"isStudent": previousValue.isStudent,
			"hasSeasonTicket": previousValue.hasSeasonTicket,
			"isWoelfeClubMember": previousValue.isWoelfeClubMember
		});
		this.userDataForm.get("club-information").patchValue({
			"clubRole": previousValue.clubRole,
			"joinDate": previousValue.joinDate
		});
		this.userDataForm.get("images").get("imagePaths").patchValue(previousValue.images);

		combineLatest(...previousValue.addresses.map(id => this.addressService.getById(id)))
			.pipe(first())
			.subscribe(addresses => {
				this.userDataForm.get("addresses").patchValue(addresses);
			});
	}

	get previousValue() {
		return this._previousValue;
	}

	@Output() onCancel = new EventEmitter();

	constructor(public loginService: LogInService,
				private formBuilder: FormBuilder,
				public userService: UserService,
				public router: Router,
				public activatedRoute: ActivatedRoute,
				public addressService: AddressService) {
		this.userDataForm = this.formBuilder.group({
			"personal-data": this.formBuilder.group({
				"firstName": ["", {
					validators: [Validators.required]
				}],
				"surname": ["", {
					validators: [Validators.required]
				}],
				"birthday": ["", {
					validators: [Validators.required]
				}],
				"gender": [Gender.OTHER, {
					validators: [Validators.required]
				}],
				"phone": ["", {
					validators: [Validators.required, Validators.pattern(/^[0-9\-+\s()]*$/)]
				}],
				"mobile": ["", {
					validators: [Validators.required, Validators.pattern(/^[0-9\-+\s()]*$/)]
				}],
				"isStudent": [false, {validators: []}],
				"hasSeasonTicket": [false, {validators: []}],
				"isWoelfeClubMember": [false, {validators: []}],
			}),
			"images": this.formBuilder.group({
				"imagePaths": [[], {validators: []}],
				"imagesToUpload": [[], {validators: []}]
			}),
			"addresses": [[], {
				validators: [Validators.required]
			}],
			"club-information": this.formBuilder.group({
				"clubRole": [ClubRole.Gast, {validators: []}],
				"joinDate": [new Date(), {validators: []}],
			})
		});

		if (this.withEmailAndPassword) {
			this.userDataForm.addControl("account-data", this.getAccountDataFormGroup());
		}
	}

	private getAccountDataFormGroup() {
		const group = this.formBuilder.group({
			"email": ["", {
				validators: [Validators.required, Validators.email]
			}],
			"password": ["", {
				validators: [Validators.required]
			}],
			"confirmedPassword": ["", {
				validators: [Validators.required]
			}]
		}, {
			validator: confirmPasswordValidator()
		});


		if (this.checkEmail) {
			group.get("email").setAsyncValidators(emailAlreadyTakenValidator(this));
		}

		return group;
	}

	ngOnInit() {
	}


	/**
	 *
	 */
	submit() {
		const previousValue = !this.previousValue ? User.create() : this.previousValue;
		const personalData = this.userDataForm.get("personal-data").value;
		const accountData = (this.userDataForm.get("account-data") && this.userDataForm.get("account-data").value)
			|| {email: "", password: ""};
		const password = accountData.password || previousValue.password || "";
		const clubInformation = this.userDataForm.get("club-information").value;

		const user = User.create().setProperties({
			id: previousValue.id,
			email: accountData.email,
			password,
			permissions: previousValue.permissions,
			miles: previousValue.miles,
			authoredItems: previousValue.authoredItems,
			bankAccounts: previousValue.bankAccounts,
			firstName: personalData.firstName,
			surname: personalData.surname,
			birthday: personalData.birthday,
			gender: personalData.gender,
			telephone: personalData.phone,
			mobile: personalData.mobile,
			isStudent: personalData.isStudent,
			hasSeasonTicket: personalData.hasSeasonTicket,
			isWoelfeClubMember: personalData.isWoelfeClubMember,
			joinDate: clubInformation.joinDate,
			clubRole: clubInformation.clubRole,
			addresses: this.userDataForm.get("addresses").value,
		});
		this.onSubmit.emit({
			user,
			images: this.userDataForm.get("images").value
		});
	}

	cancel() {
		this.onCancel.emit(true);
	}
}

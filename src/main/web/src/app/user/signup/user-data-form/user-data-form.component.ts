import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {Gender} from "../../../shared/model/gender";
import {ClubRole} from "../../../shared/model/club-role";
import {LogInService} from "../../../shared/services/api/login.service";
import {AddressService} from "../../../shared/services/api/address.service";
import {Address} from "../../../shared/model/address";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../shared/services/api/user.service";
import {FormControlDirective} from "@angular/forms";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {first, map} from "rxjs/operators";

@Component({
	selector: "memo-user-data-form",
	templateUrl: "./user-data-form.component.html",
	styleUrls: ["./user-data-form.component.scss"]
})
export class UserDataFormComponent implements OnInit, OnChanges {
	@Output() onSubmit = new EventEmitter<any>();
	@Input() withSubmitButton = true;
	@Input() withEmailAndPassword = false;
	@Input() previousValue = {};
	confirmedPassword = "";
	@Input() model = {};
	@Input() profilePicture: any = "resources/images/Logo.png";
	@Output() modelChange = new EventEmitter();
	@Output() onCancel = new EventEmitter();
	@Output() onAddressModification = new EventEmitter();

	editUrl$ = this.activatedRoute.paramMap
		.pipe(
			map(paramMap => paramMap.get("id")),
			map(id => id === null || id === "create"
				? "/address"
				: `/members/${id}/address`)
		);
	genderOptions = [Gender.FEMALE, Gender.MALE, Gender.OTHER];
	clubRoleOptions = [ClubRole.Organisator, ClubRole.Admin, ClubRole.Vorstand, ClubRole.Kassenwart, ClubRole.Mitglied, ClubRole.Gast];
	isAdmin = this.loginService.currentUser$
		.pipe(
			map(user => user !== null && user.clubRole === ClubRole.Admin)
		);
	addressesSubject$ = new BehaviorSubject<Address[]>([]);

	emailIsAlreadyTaken = false;

	constructor(public loginService: LogInService,
				public userService: UserService,
				public router: Router,
				public activatedRoute: ActivatedRoute,
				public addressService: AddressService) {
	}


	get userModel() {
		return this.model;
	}

	set userModel(model) {
		this.model = model;
		this.modelChange.emit(this.model);
	}

	@Input()
	set addresses(addresses: Address[]) {
		this.addressesSubject$.next(addresses);
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges(changes: SimpleChanges): void {
		if (changes["model"] && !changes["addresses"]) {
			this.addressesSubject$.next(this.userModel["addresses"]);
		}
	}

	/**
	 *
	 */
	submit() {
		if (this.withEmailAndPassword) {
			this.userModel = {...this.userModel};

			this.userService.isUserEmailAlreadyInUse(this.userModel["email"])
				.pipe(
					first()
				)
				.subscribe(isAlreadyInUse => {
					if (isAlreadyInUse && this.userModel["email"] !== this.previousValue["email"]) {
						this.emailIsAlreadyTaken = true;
					}
					else {
						this.onSubmit.emit({
							...this.userModel,
							profilePicture: this.profilePicture
						});
					}
				});
		}
		else {
			this.onSubmit.emit({
				...this.userModel,
				profilePicture: this.profilePicture
			});
		}
	}

	/**
	 *
	 * @param {FormControlDirective} userDataForm
	 * @returns {boolean}
	 */
	userCanSaveChanges(userDataForm: FormControlDirective): boolean {
		return userDataForm.form.valid
			&& (this.previousValueIsEmpty() || !this.modelHasNotChanged())
			&& (!this.userModel['password'] || this.userModel['password'].length === 0
				|| !this.withEmailAndPassword || this.userModel['password'] === this.confirmedPassword)
			&& !this.emailIsAlreadyTaken
			&& this.userModel["addresses"] && this.userModel["addresses"].length > 0;
	}

	/**
	 * Checks whether the previous value is set at all
	 * @returns {boolean}
	 */
	previousValueIsEmpty() {
		return !this.previousValue || Object.keys(this.previousValue).length === 0;
	}

	/**
	 * Checks whether the previous values are identical to the ones currently entered into the form
	 *  => the user hasnt changed the values at all (or entered the ones that were saved previously)
	 * @returns {{} | boolean}
	 */
	modelHasNotChanged() {
		return this.previousValue
			&& Object.keys(this.previousValue).length > 0
			&& Object.keys(this.previousValue)
				.filter(key => !key.includes("password"))
				.every(key => this.userModel[key] === this.previousValue[key])
		// && Object.keys(this.userModel).every(key => this.previousValue[key] === this.userModel[key]);
	}

	/**
	 *
	 * @param {FormData} event
	 */
	profilePictureChanged(event: FormData) {
		this.profilePicture = event;
		console.log(event);
	}

	/**
	 *
	 */
	navigateToAddressModifications() {
		this.addressService.redirectUrl = this.router.url;
		this.onAddressModification.emit({
			...this.userModel,
			profilePicture: this.profilePicture
		});
	}

	/**
	 *
	 * @param {Address} address
	 */
	deleteAddress(address: Address) {
		this.addressesSubject$.next(
			this.addressesSubject$.value
				.filter(_address => _address.id !== address.id)
		);
		if (this.userModel["addresses"]) {
			const addressIndex = this.userModel["addresses"].findIndex(addressId => addressId === address.id);
			this.userModel["addresses"] = this.userModel["addresses"].splice(addressIndex, 1);
		}
		this.addressService.remove(address.id)
			.subscribe(() => this.onAddressModification.emit({action: "delete", address}));
	}

	cancel() {
		this.onCancel.emit(true);
	}
}

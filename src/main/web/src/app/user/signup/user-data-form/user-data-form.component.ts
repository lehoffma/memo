import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Gender} from "../../../shared/model/gender";
import {ClubRole} from "../../../shared/model/club-role";
import {LogInService} from "../../../shared/services/login.service";
import {AddressService} from "../../../shared/services/address.service";
import {Observable} from "rxjs/Observable";
import {Address} from "../../../shared/model/address";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Router} from "@angular/router";

@Component({
	selector: "memo-user-data-form",
	templateUrl: "./user-data-form.component.html",
	styleUrls: ["./user-data-form.component.scss"]
})
export class UserDataFormComponent implements OnInit {
	@Output() onSubmit = new EventEmitter<any>();
	@Input() withSubmitButton = true;
	@Input() withEmailAndPassword = false;
	@Input() previousValue = {};
	confirmedPassword = "";
	@Input() model = {
		email: undefined,
		password: undefined,
		firstName: undefined,
		surname: undefined,
		gender: undefined,
		birthday: undefined,
		phoneNumber: undefined,
		isStudent: undefined,
		profilePicture: undefined
	};
	@Output() modelChange = new EventEmitter();
	@Output() onCancel = new EventEmitter();


	editUrl$ = this.loginService.accountObservable
		.map(id => id === null
			? "/address"
			: `/members/${id}/address`);

	get userModel() {
		return this.model;
	}

	set userModel(model) {
		this.model = model;
		this.modelChange.emit(this.model);
	}

	genderOptions = [Gender.FEMALE, Gender.MALE, Gender.OTHER];
	clubRoleOptions = [ClubRole.Organizer, ClubRole.Admin, ClubRole.Vorstand, ClubRole.Kassenwart, ClubRole.Mitglied, ClubRole.None];

	isAdmin = this.loginService.currentUser().map(user => {
		return user !== null && user.clubRole === ClubRole.Admin;
	});

	addresses$ = this.loginService.currentUser().flatMap(user => {
		return user === null
			? Observable.of([])
			: Observable.forkJoin(...user.addresses.map(addressId => this.addressService.getById(addressId)));
	});

	addressesSubject$ = new BehaviorSubject<Address[]>([]);

	defaultImageUrl = "resources/images/Logo.png";

	constructor(public loginService: LogInService,
				public router: Router,
				public addressService: AddressService) {
		this.addresses$.subscribe(addresses => this.addressesSubject$.next(addresses));
	}

	ngOnInit() {
	}

	submit() {
		this.onSubmit.emit(this.model);
	}

	/**
	 * Checks whether the previous values are identical to the ones currently entered into the form
	 *  => the user hasnt changed the values at all (or entered the ones that were saved previously)
	 * @returns {{} | boolean}
	 */
	modelHasNotChanged() {
		return this.previousValue
			&& Object.keys(this.previousValue).length > 0
			&& Object.keys(this.previousValue).every(key => this.model[key] === this.previousValue[key])
			&& Object.keys(this.model).every(key => this.previousValue[key] === this.model[key]);
	}

	/**
	 *
	 * @param {FormData} event
	 */
	profilePictureChanged(event: FormData) {
		this.model.profilePicture = event;
	}

	/**
	 *
	 */
	navigateToAddressModifications() {
		this.addressService.redirectUrl = this.router.url;
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
	}

	cancel() {
		this.onCancel.emit(true);
	}
}

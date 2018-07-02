import {Injectable} from "@angular/core";
import {createUser, User} from "../../shared/model/user";
import {PaymentInfo} from "./payment-methods-form/debit-input-form/payment-info";
import {SignUpSection} from "./signup-section";
import {SignUpSubmitEvent} from "./signup-submit-event";
import {NavigationService} from "../../shared/services/navigation.service";
import {UserService} from "../../shared/services/api/user.service";
import {MatSnackBar} from "@angular/material";
import {LogInService} from "../../shared/services/api/login.service";
import {Address} from "../../shared/model/address";
import {AddressService} from "../../shared/services/api/address.service";
import {UserBankAccountService} from "../../shared/services/api/user-bank-account.service";
import {createBankAccount} from "../../shared/model/bank-account";
import {ImageUploadService} from "../../shared/services/api/image-upload.service";
import {catchError, first, map, mergeMap, tap} from "rxjs/operators";
import {Observable, of, throwError} from "rxjs";
import {ModifiedImages} from "../../shop/shop-item/modify-shop-item/modified-images";
import {processSequentially} from "../../util/observable-util";
import {ImageToUpload} from "../../shared/utility/multi-image-upload/image-to-upload";
import {EMPTY} from "rxjs";
import {setProperties} from "../../shared/model/util/base-object";

@Injectable()
export class SignUpService {
	newUser: User = createUser();
	newUserProfilePicture: ImageToUpload[];
	newUserDebitInfo: PaymentInfo;
	newUserAddresses: Address[] = [];
	submittingFinalUser = false;

	signUpWasJustCompleted = false;
	sections = [SignUpSection.AccountData, SignUpSection.PersonalData, SignUpSection.PaymentMethods];

	constructor(private navigationService: NavigationService,
				private addressService: AddressService,
				private imageUploadService: ImageUploadService,
				private bankAccountService: UserBankAccountService,
				private userService: UserService,
				private snackBar: MatSnackBar,
				private loginService: LogInService) {

	}

	reset() {
		this.newUser = createUser();
		this.newUserProfilePicture = null;
		this.newUserDebitInfo = null;
		this.newUserAddresses = [];
	}


	/**
	 *
	 * @param section
	 */
	navigateToSection(section: SignUpSection) {
		this.navigationService.navigateByUrl(`signup/${section}`)
	}

	/**
	 *
	 * @param section
	 * @returns {SignUpSection|SignUpSection|SignUpSection}
	 */
	getNextSection(section: SignUpSection): SignUpSection {
		let indexOfSection = this.sections.indexOf(section);
		return this.sections[indexOfSection + 1];
	}

	/**
	 *
	 * @param currentSection
	 * @returns {boolean}
	 */
	navigateToNextSection(currentSection: SignUpSection): boolean {
		//done
		if (currentSection === SignUpSection.PaymentMethods) {
			return true;
		}
		//next section
		else {
			let nextSection = this.getNextSection(currentSection);
			this.navigateToSection(nextSection);
			return false;
		}
	}

	/**
	 *
	 * @param {User} user
	 * @param {PaymentInfo} paymentInfo
	 * @returns {Observable<User>}
	 */
	uploadBankAccount(user: User, paymentInfo: PaymentInfo): Observable<User> {
		if (!paymentInfo) {
			return of(user);
		}

		return this.bankAccountService.add(setProperties(createBankAccount(),
			{
				bic: this.newUserDebitInfo.bic,
				iban: this.newUserDebitInfo.iban,
				name: user.firstName + " " + user.surname
			}))
			.pipe(
				map(bankAccount => setProperties(user, {bankAccounts: [bankAccount.id]}))
			);
	}

	/**
	 *
	 * @param {User} user
	 * @param {Address[]} addresses
	 * @returns {Observable<User>}
	 */
	uploadAddresses(user: User, addresses: Address[]): Observable<User> {
		if (addresses.length === 0) {
			return of(user);
		}

		return processSequentially(
			addresses
				.map(it => this.addressService.add(it))
		)
			.pipe(
				map(addresses => addresses.map(it => it.id)),
				map(addressIds => setProperties(user, {addresses: addressIds}))
			);
	}

	/**
	 *
	 * @param {User} user
	 * @param {FormData} pictures
	 * @returns {Promise<User>}
	 */
	uploadProfilePicture(user: User, pictures: ImageToUpload[]): Observable<User> {
		if (!pictures) {
			//no images were specified => don't bother performing the request
			return of(user);
		}

		let formData = new FormData();
		pictures.forEach(image => {
			const blob = this.imageUploadService.dataURItoBlob(image.data);
			formData.append("file[]", blob, image.name);
		});

		return this.imageUploadService.uploadImages(formData)
			.pipe(
				map(response => response.images),
				map(images => setProperties(user, {images}))
			);
	}

	/**
	 *
	 * @param section
	 * @param event
	 */
	async onSubmit(section: SignUpSection, event: SignUpSubmitEvent) {
		//extract section, email and password properties
		const {
			email,
			password,
			firstName,
			surname,
			birthday,
			telephone,
			hasSeasonTicket,
			isWoelfeClubMember,
			gender,
			hasDebitAuth,
			mobile,
			isStudent,
			addresses,
			paymentInfo
		} = event;


		switch (section) {
			case SignUpSection.AccountData:
				this.newUser = setProperties(this.newUser, {email, password});
				break;
			case SignUpSection.PersonalData:
				const images: ModifiedImages = event.images;
				this.newUser = setProperties(this.newUser, {
					firstName, surname, birthday, telephone, mobile, isStudent, addresses,
					hasSeasonTicket, isWoelfeClubMember, gender, hasDebitAuth
				});
				this.newUserProfilePicture = images.imagesToUpload;
				break;
			case SignUpSection.PaymentMethods:
				this.newUserDebitInfo = paymentInfo;
				break;
		}

		//next section
		let isLastScreen = this.navigateToNextSection(section);

		if (isLastScreen) {
			this.submittingFinalUser = true;


			//upload profile picture
			this.uploadProfilePicture(this.newUser, this.newUserProfilePicture)
				.pipe(
					mergeMap(newUser => this.uploadAddresses(newUser, (<any>this.newUser.addresses))),
					//add bank account and its address to user
					mergeMap(newUser => this.uploadBankAccount(newUser, this.newUserDebitInfo)),
					mergeMap(newUser => this.userService.add(newUser)),
					tap(() => this.snackBar.open("Die Registrierung war erfolgreich!", "Schließen", {
						duration: 1000
					})),
					mergeMap(() => this.loginService.login(this.newUser.email, this.newUser.password)),
					tap(wereCorrect => {
						if (wereCorrect) {
							this.signUpWasJustCompleted = true;
							this.navigationService.navigateByUrl("/signup/completed");
							this.reset();
							this.submittingFinalUser = false;
						}
						else {
							throwError(new Error());
						}
					}),
					catchError(error => {
						this.snackBar.open(
							"Bei der Registrierung ist leider ein Fehler aufgetreten! Grund: " + error.message,
							"Schließen",
							{
								duration: 10000,
							});
						return EMPTY;
					}),
					first()
				)
				.subscribe(null, null, () => this.submittingFinalUser = false);
		}
	}
}

import {Injectable} from "@angular/core";
import {User} from "../../shared/model/user";
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
import {BankAccount} from "../../shared/model/bank-account";
import {ImageUploadService} from "../../shared/services/api/image-upload.service";
import {catchError, filter, first, map, mergeMap, tap} from "rxjs/operators";
import {_throw} from "rxjs/observable/throw";
import {empty} from "rxjs/observable/empty";
import {Observable} from "rxjs/Observable";
import {of} from "rxjs/observable/of";

@Injectable()
export class SignUpService {
	newUser: User = User.create();
	newUserProfilePicture;
	newUserDebitInfo: PaymentInfo;
	newUserAddresses: Address[] = [];
	submittingFinalUser = false;

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
		this.newUser = User.create();
		this.newUserProfilePicture = null;
		this.newUserDebitInfo = null;
		this.newUserAddresses = [];
	}


	/**
	 *
	 */
	watchForAddressModification(model: any) {
		if (model.action && model.action === "delete") {
			const addressToDelete = model.address;
			const currentAddresses = this.newUserAddresses;
			const deletedAddressId = currentAddresses
				.findIndex(currentAddress => currentAddress.id === addressToDelete.id);

			if (deletedAddressId >= 0) {
				currentAddresses.splice(deletedAddressId, 1);
			}

			this.newUserAddresses = [...currentAddresses];
			this.newUser.setProperties({addresses: currentAddresses.map(it => it.id)})
		}
		if (model && model.profilePicture) {
			this.newUserProfilePicture = model.profilePicture;
		}
		this.addressService.addressModificationDone
			.pipe(first(), filter(it => !!it))
			.subscribe(address => {
				const currentAddresses = this.newUserAddresses;
				const modifiedAddressIndex = currentAddresses
					.findIndex(currentAddress => currentAddress.id === address.id);
				//address was added, not modified
				if (modifiedAddressIndex === -1) {
					currentAddresses.push(address);
				}
				//address was modified
				else {
					currentAddresses.splice(modifiedAddressIndex, 1, address);
				}
				this.newUserAddresses = [...currentAddresses];
				this.newUser.setProperties({addresses: currentAddresses.map(it => it.id)})
			})
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
	 * @param {FormData} pictures
	 * @returns {Promise<User>}
	 */
	uploadProfilePicture(user: User, pictures: FormData): Observable<User> {
		if (!pictures) {
			//no images were specified => dont bother performing the request
			return of(user);
		}

		return this.imageUploadService.uploadImages(pictures)
			.pipe(
				map(response => response.imagePaths),
				map(imagePaths => user.setProperties({imagePaths}))
			);
	}

	/**
	 *
	 * @param section
	 * @param event
	 */
	async onSubmit(section: SignUpSection, event: SignUpSubmitEvent) {
		//todo 11.12.
		//bankdaten addresse address-selection benutzen
		//todo user bestätigung => screen: "email wurde an dich geschickt"
		//todo if admin: show "isMember"
		//todo banner: mitglied werden/bin schon mitglied
		//todo get image returned {fileName: str}
		//todo permission api
		//		

		//image: post -> response.imagePaths in objekt tun

		//extract section, email and password properties
		const {
			email,
			password,
			firstName,
			surname,
			birthday,
			telephone,
			mobile,
			isStudent,
			profilePicture,
			paymentInfo
		} = event;

		switch (section) {
			case SignUpSection.AccountData:
				this.newUser.setProperties({email, password});
				break;
			case SignUpSection.PersonalData:
				this.newUser.setProperties({firstName, surname, birthday, telephone, mobile, isStudent});
				this.newUserProfilePicture = profilePicture;
				break;
			case SignUpSection.PaymentMethods:
				this.newUserDebitInfo = paymentInfo;
				//add bank account address to user
				if (paymentInfo && paymentInfo.address) {
					await this.addressService.add(Address.create()
						.setProperties({
							...paymentInfo.address
						}))
						.pipe(
							tap(address => this.newUserAddresses.push(address)),
							tap(address => this.newUser.addresses.push(address.id)),
							mergeMap(_ => this.bankAccountService.add(BankAccount.create()
								.setProperties({
									bic: this.newUserDebitInfo.bic,
									iban: this.newUserDebitInfo.iban,
									name: this.newUserDebitInfo.address.name
								}))),
							tap(bankAccount => this.newUser.bankAccounts.push(bankAccount.id))
						)
						.toPromise();
				}
				break;
		}

		//next section
		let isLastScreen = this.navigateToNextSection(section);

		if (isLastScreen) {
			this.submittingFinalUser = true;
			//upload profile picture
			this.uploadProfilePicture(this.newUser, this.newUserProfilePicture)
				.pipe(
					mergeMap(newUser => this.userService.add(newUser, this.newUserProfilePicture)),
					tap(() => this.snackBar.open("Die Registrierung war erfolgreich!", "Schließen", {
						duration: 1000
					})),
					mergeMap(() => this.loginService.login(this.newUser.email, this.newUser.password)),
					tap(wereCorrect => {
						if (wereCorrect) {
							this.navigationService.navigateByUrl("/");
							this.reset();
							this.submittingFinalUser = false;
						}
						else {
							return _throw(new Error());
						}
					}),
					catchError(error => {
						this.snackBar.open(
							"Bei der Registrierung ist leider ein Fehler aufgetreten! Grund: " + error.message,
							"Schließen",
							{
								duration: 10000,
							});
						return empty();
					}),
					first()
				)
				.subscribe(null, null, () => this.submittingFinalUser = false);
		}
	}
}

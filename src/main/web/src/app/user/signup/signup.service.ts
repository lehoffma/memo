import {Injectable} from "@angular/core";
import {User} from "../../shared/model/user";
import {PaymentInfo} from "./payment-methods-form/debit-input-form/payment-info";
import {SignUpSection} from "./signup-section";
import {SignUpSubmitEvent} from "./signup-submit-event";
import {NavigationService} from "../../shared/services/navigation.service";
import {UserService} from "../../shared/services/api/user.service";
import {MdSnackBar} from "@angular/material";
import {LogInService} from "../../shared/services/api/login.service";
import {Address} from "../../shared/model/address";
import {AddressService} from "../../shared/services/api/address.service";
import {UserBankAccountService} from "../../shared/services/api/user-bank-account.service";
import {BankAccount} from "../../shared/model/bank-account";
import {ImageUploadService} from "../../shared/services/api/image-upload.service";

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
				private snackBar: MdSnackBar,
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
			.first()
			.subscribe(address => {
				if (address) {
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
				}
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
	 * @param {FormData} picture
	 * @returns {Promise<User>}
	 */
	uploadProfilePicture(user: User, picture: FormData) {

		return this.imageUploadService.uploadImage(picture)
			.map(response => response.imagePath)
			.map(imagePath => user.setProperties({imagePath}));
	}

	/**
	 *
	 * @param section
	 * @param event
	 */
	async onSubmit(section: SignUpSection, event: SignUpSubmitEvent) {
		//extract section, email and passwordHash properties
		const {
			email,
			passwordHash,
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
				this.newUser.setProperties({email, passwordHash});
				break;
			case SignUpSection.PersonalData:
				this.newUser.setProperties({firstName, surname, birthday, telephone, mobile, isStudent});
				this.newUserProfilePicture = profilePicture;
				break;
			case SignUpSection.PaymentMethods:
				this.newUserDebitInfo = paymentInfo;
				//add bank account address to user
				if(paymentInfo && paymentInfo.address){
					await this.addressService.add(Address.create()
						.setProperties({
							...paymentInfo.address
						}))
						.do(address => this.newUserAddresses.push(address))
						.do(address => this.newUser.addresses.push(address.id))
						.flatMap(_ => this.bankAccountService.add(BankAccount.create()
							.setProperties({
								bic: this.newUserDebitInfo.bic,
								iban: this.newUserDebitInfo.iban,
								name: this.newUserDebitInfo.address.name
							})))
						.do(bankAccount => this.newUser.bankAccounts.push(bankAccount.id))
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
				.flatMap(newUser => this.userService.add(newUser, this.newUserProfilePicture))
				.subscribe(newUserId => {
						this.snackBar.open("Die Registrierung war erfolgreich!", "Schließen", {
							duration: 1000
						});
						this.loginService.login(this.newUser.email, this.newUser.passwordHash)
							.subscribe(wereCorrect => {
								if (wereCorrect) {
									this.navigationService.navigateByUrl("/");
									this.reset();
									this.submittingFinalUser = false;
								}
								else {
									this.snackBar.open("Bei der Registrierung ist leider ein Fehler aufgetreten!",
										"Schließen",
										{
											duration: 1000
										});
								}
							})
					},
					(error: Error) => {
						this.snackBar.open(
							"Bei der Registrierung ist leider ein Fehler aufgetreten!" + error.message,
							"Schließen",
							{
								duration: 10000,
							});
						this.submittingFinalUser = false;
					})
		}
	}
}

import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {ActivatedRoute} from "@angular/router";
import {NavigationService} from "../../shared/services/navigation.service";
import {Observable} from "rxjs";
import {SignUpSubmitEvent} from "./signup-submit-event";
import {SignUpSection} from "./signup-section";
import {PaymentInfo} from "./payment-methods-form/debit-input-form/payment-info";
import {UserService} from "../../shared/services/user.service";

@Component({
	selector: "memo-signup",
	templateUrl: "./signup.component.html",
	styleUrls: ["./signup.component.scss"]
})
export class SignUpComponent implements OnInit {
	private currentDate: Date = new Date();
	private newUser: User = User.create();
	private newUserProfilePicture;
	private newUserDebitInfo: PaymentInfo;

	sectionEnum = SignUpSection;
	sections = [SignUpSection.AccountData, SignUpSection.PersonalData, SignUpSection.PaymentMethods];
	public currentSection: Observable<SignUpSection> = this.activatedRoute.params.map(params => params["step"]);

	constructor(private navigationService: NavigationService,
				private userService: UserService,
				private activatedRoute: ActivatedRoute) {
	}

	ngOnInit() {
		//falls der user manuell eine section eingibt, obwohl eine vorherige noch nicht abgeschlossen
		//wurde, wird er zur ersten weitergeleitet
		this.currentSection
			.filter(section => section !== SignUpSection.AccountData)
			.filter(section => this.newUser.email === "" || this.newUser.passwordHash === "")
			.subscribe(
				// section => this.navigateToSection(SignUpSection.AccountData)
			);
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
	 * @param section
	 * @param event
	 */
	onSubmit(section: SignUpSection, event: SignUpSubmitEvent) {
		console.log(event);
		//extract section, email and passwordHash properties
		const {
			email,
			passwordHash,
			firstName,
			surname,
			birthday,
			phoneNumber,
			isStudent,
			profilePicture,
			paymentInfo
		} = event;

		switch (section) {
			case SignUpSection.AccountData:
				this.newUser.setProperties({email, passwordHash});
				break;
			case SignUpSection.PersonalData:
				this.newUser.setProperties({firstName, surname, birthDate: birthday, telephone: phoneNumber, isStudent});
				this.newUserProfilePicture = profilePicture;
				break;
			case SignUpSection.PaymentMethods:
				this.newUserDebitInfo = paymentInfo;
				break;
		}

		//next section
		let isLastScreen = this.navigateToNextSection(section);

		if (isLastScreen) {
			this.userService.addOrModify(this.newUser, {profilePicture: this.newUserProfilePicture, paymentInfo: this.newUserDebitInfo})
				.subscribe(newUserId => {
					//todo: show success page? ¯\_(ツ)_/¯
					console.log(newUserId);
				});
		}
	}
}

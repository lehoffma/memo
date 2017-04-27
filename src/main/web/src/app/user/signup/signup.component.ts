import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {ActivatedRoute} from "@angular/router";
import {NavigationService} from "../../shared/services/navigation.service";
import {Observable} from "rxjs";
import {SignUpSubmitEvent} from "./signup-submit-event";
import {SignUpSection} from "./signup-section";

@Component({
	selector: "memo-signup",
	templateUrl: "./signup.component.html",
	styleUrls: ["./signup.component.scss"]
})
export class SignUpComponent implements OnInit {
	private currentDate: Date = new Date();
	private newUser: User = User.create();

	sectionEnum = SignUpSection;
	sections = [SignUpSection.AccountData, SignUpSection.PersonalData, SignUpSection.three];
	public currentSection: Observable<SignUpSection> = this.activatedRoute.params.map(params => params["step"]);

	constructor(private navigationService: NavigationService,
				private activatedRoute: ActivatedRoute) {
	}

	ngOnInit() {
		//falls der user manuell eine section eingibt, obwohl eine vorherige noch nicht abgeschlossen
		//wurde, wird er zur ersten weitergeleitet
		this.currentSection
			.filter(section => section !== SignUpSection.AccountData)
			.filter(section => this.newUser.email === "" || this.newUser.passwordHash === "")
			.subscribe(
				section => this.navigateToSection(SignUpSection.AccountData)
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
		if (currentSection === SignUpSection.three) {
			return false
		}
		//next section
		else {
			let nextSection = this.getNextSection(currentSection);
			this.navigateToSection(nextSection);
			return true;
		}
	}

	/**
	 *
	 * @param event
	 */
	onSubmit(event: SignUpSubmitEvent) {
		//extract section, email and passwordHash properties
		const {
			section,
			email,
			passwordHash,
			firstName,
			surname,
			birthday,
			phoneNumber,
			isStudent
		} = event;

		switch (section) {
			case SignUpSection.AccountData:
				this.newUser.setProperties({email, passwordHash});
				break;
			case SignUpSection.PersonalData:
				this.newUser.setProperties({firstName, surname, birthDate: birthday, telephone: phoneNumber, isStudent});
				break;
			case SignUpSection.three:
				break;
		}

		//next section
		let isLastScreen = this.navigateToNextSection(section);

		//todo tu etwas wenn isLastScreen === true
	}
}

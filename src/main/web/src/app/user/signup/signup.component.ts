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
	private newUser: User = new User();

	sectionEnum = SignUpSection;
	sections = [SignUpSection.AccountData, SignUpSection.PersonalData, SignUpSection.three];
	private currentSection: Observable<SignUpSection> = this.activatedRoute.params.map(params => params["step"]);

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


	navigateToSection(section: SignUpSection) {
		this.navigationService.navigateByUrl(`signup/${section}`)
	}


	getNextSection(section: SignUpSection): SignUpSection {
		let indexOfSection = this.sections.indexOf(section);
		return this.sections[indexOfSection + 1];
	}

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
				this.newUser.email = email;
				this.newUser.passwordHash = passwordHash;
				break;
			case SignUpSection.PersonalData:
				this.newUser.firstName = firstName;
				this.newUser.surname = surname;
				this.newUser.birthDate = birthday;
				this.newUser.telephone = phoneNumber;
				this.newUser.isStudent = isStudent;
				break;
			case SignUpSection.three:
				break;
		}

		//next section
		let isLastScreen = this.navigateToNextSection(section);

		//todo tu etwas wenn isLastScreen === true
	}
}

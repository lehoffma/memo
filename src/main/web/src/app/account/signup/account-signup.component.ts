import {Component, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {ActivatedRoute, Router} from "@angular/router";
import {NavigationService} from "../../shared/services/navigation.service";
import {Observable} from "rxjs";

export enum SignUpSection{
	AccountData = <any> "AccountData",
	two = <any> "two",
	three = <any> "three"
}

export interface SignUpSubmitEvent {
	section: SignUpSection,
	email?: string,
	passwordHash?: string
}

@Component({
	selector: 'account-signup',
	templateUrl: './account-signup.component.html',
	styleUrls: ["./account-signup.component.scss"]
})
export class AccountSignUpComponent implements OnInit {
	private currentDate: Date = new Date();
	private newUser: User = new User();

	sectionEnum = SignUpSection;
	sections = Object.keys(this.sectionEnum);
	private currentSection: Observable<SignUpSection> = this.activatedRoute.params.map(params => params["step"]);

	constructor(private router: Router,
				private navigationService: NavigationService,
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
		let indexOfSection = this.sections.indexOf(SignUpSection[section]);
		return SignUpSection[this.sections[indexOfSection + 1]];
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
		let {section, email, passwordHash} = event;

		if (section === SignUpSection.AccountData) {
			this.newUser.email = email;
			this.newUser.passwordHash = passwordHash;
		}

		//next section
		let isLastScreen = this.navigateToNextSection(section);

		//todo tu etwas wenn isLastScreen === true
	}
}

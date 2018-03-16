import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {SignUpSubmitEvent} from "./signup-submit-event";
import {SignUpSection, toTitle} from "./signup-section";
import {SignUpService} from "./signup.service";
import {filter, map} from "rxjs/operators";
import {Observable} from "rxjs/Observable";

@Component({
	selector: "memo-signup",
	templateUrl: "./signup.component.html",
	styleUrls: ["./signup.component.scss"]
})
export class SignUpComponent implements OnInit {
	sectionEnum = SignUpSection;
	public currentSection: Observable<SignUpSection> = this.activatedRoute.params
		.pipe(
			map(params => params["step"])
		);
	getTitleOfSection = toTitle;

	constructor(public signUpService: SignUpService,
				private activatedRoute: ActivatedRoute) {
	}

	ngOnInit() {
		//falls der user manuell eine section eingibt, obwohl eine vorherige noch nicht abgeschlossen
		//wurde, wird er zur ersten weitergeleitet
		this.currentSection
			.pipe(
				filter(section => section !== SignUpSection.AccountData),
				filter(section => this.signUpService.newUser.email === "" || this.signUpService.newUser.password === "")
			)
			.subscribe(
				section => this.signUpService.navigateToSection(SignUpSection.AccountData)
			);
	}

	/**
	 *
	 */
	watchForAddressModification(model: any) {
		this.signUpService.watchForAddressModification(model);
	}

	/**
	 *
	 * @param section
	 * @param event
	 */
	onSubmit(section: SignUpSection, event: SignUpSubmitEvent) {
		this.signUpService.onSubmit(section, event);
	}
}

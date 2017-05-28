import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {SignUpSubmitEvent} from "../signup-submit-event";
import {SignUpSection} from "../signup-section";
import {Gender} from "../../../shared/model/gender";
import {ClubRole} from "../../../shared/model/club-role";
import {LogInService} from "../../../shared/services/login.service";

@Component({
	selector: "memo-user-data-form",
	templateUrl: "./user-data-form.component.html",
	styleUrls: ["./user-data-form.component.scss"]
})
export class UserDataFormComponent implements OnInit {
	@Output() onSubmit = new EventEmitter<any>();
	@Input() withSubmitButton = true;
	@Input() model = {
		firstName: undefined,
		surname: undefined,
		birthday: undefined,
		phoneNumber: undefined,
		isStudent: undefined,
		profilePicture: undefined
	};
	@Output() modelChange = new EventEmitter();
	@Output() onCancel = new EventEmitter();

	get userModel(){
		return this.model;
	}

	set userModel(model){
		this.model = model;
		this.modelChange.emit(this.model);
	}

	genderOptions = [Gender.FEMALE, Gender.MALE, Gender.OTHER];
	clubRoleOptions = [ClubRole.Organizer, ClubRole.Admin, ClubRole.Vorstand, ClubRole.Kasse, ClubRole.Mitglied, ClubRole.None];

	isAdmin = this.loginService.currentUser().map(user => {
		return user !== null && user.clubRole === ClubRole.Admin;
	});

	defaultImageUrl = "resources/images/Logo.png";

	constructor(public loginService: LogInService) {
	}

	ngOnInit() {
	}


	submit() {
		this.onSubmit.emit(this.model);
	}

	profilePictureChanged(event: FormData) {
		this.model.profilePicture = event;
	}

	cancel(){
		this.onCancel.emit(true);
	}
}

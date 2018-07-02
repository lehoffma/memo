import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {ClubRole} from "../../model/club-role";
import {Observable} from "rxjs";
import {UserService} from "../../services/api/user.service";
import {LogInService} from "../../services/api/login.service";
import {map} from "rxjs/operators";

@Component({
	selector: "memo-club-information-form",
	templateUrl: "./club-information-form.component.html",
	styleUrls: ["./club-information-form.component.scss"]
})
export class ClubInformationFormComponent implements OnInit, OnDestroy {
	@Input() formGroup: FormGroup;

	isAdmin$: Observable<boolean> = this.loginService.currentUser$
		.pipe(map(user => user !== null && user.clubRole === ClubRole.Admin));
	clubRoleOptions = [ClubRole.Organisator, ClubRole.Admin, ClubRole.Vorstand, ClubRole.Kassenwart, ClubRole.Mitglied, ClubRole.Gast];

	subscription;

	constructor(private userService: UserService,
				private loginService: LogInService) {
	}

	ngOnInit() {
		this.subscription = this.isAdmin$.subscribe(isAdmin => {
			if (isAdmin) {
				this.formGroup.get("clubRole").enable();
				this.formGroup.get("joinDate").enable();
			}
			else {
				this.formGroup.get("clubRole").disable();
				this.formGroup.get("joinDate").disable();
			}
		})
	}

	ngOnDestroy(): void {
	}

}

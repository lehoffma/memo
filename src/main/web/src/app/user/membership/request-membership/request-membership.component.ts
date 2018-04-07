import {Component, OnDestroy, OnInit} from "@angular/core";
import {ClubRole, clubRoles} from "../../../shared/model/club-role";
import {FormBuilder, FormGroup} from "@angular/forms";
import {LogInService} from "../../../shared/services/api/login.service";
import {first} from "rxjs/operators";
import {valueHasChangedValidator} from "../../../shared/validators/value-has-changed.validator";
import {HttpClient} from "@angular/common/http";

@Component({
	selector: "memo-request-membership",
	templateUrl: "./request-membership.component.html",
	styleUrls: ["./request-membership.component.scss"]
})
export class RequestMembershipComponent implements OnInit, OnDestroy {
	formGroup: FormGroup = this.formBuilder.group({
		"newRole": [undefined, {
			validators: []	//todo: isnotsamerole.validator
		}]
	});
	clubRoles = clubRoles();

	previousValue: ClubRole;
	userId: number;

	loading = false;
	success = false;
	error = null;

	subscriptions = [];

	constructor(private formBuilder: FormBuilder,
				private http: HttpClient,
				private loginService: LogInService) {
		this.loginService.currentUser$
			.pipe(
				first()
			)
			.subscribe(user => {
				this.previousValue = user.clubRole;
				this.userId = user.id;
				this.formGroup.get("newRole").setValue(user.clubRole);
				this.formGroup.get("newRole").setValidators([valueHasChangedValidator(this.previousValue)]);
				this.formGroup.get("newRole").updateValueAndValidity()
			})

		this.subscriptions = [
			this.formGroup.valueChanges.subscribe(value => this.error = null)
		];
	}

	ngOnInit() {
	}

	submit() {
		const newRole = this.formGroup.get("newRole").value;
		this.loading = true;
		this.error = null;
		this.http.post("/api/requestRoleChange", {userId: this.userId, newRole})
			.subscribe(() => {
				this.success = true;
				this.loading = false;
			}, error => {
				this.error = error;
				this.loading = false;
			})
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe())
	}

}

import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {confirmPasswordValidator} from "../../shared/validators/confirm-password.validator";
import {PasswordRecoveryService} from "./password-recovery.service";
import {ActivatedRoute, Router} from "@angular/router";
import {filter, mergeMap, tap} from "rxjs/operators";
import {LogInService} from "../../shared/services/api/login.service";
import {MatSnackBar} from "@angular/material";
import {JwtHelperService} from "../../shared/services/jwt-helper.service";

@Component({
	selector: "memo-password-recovery-landing-page",
	templateUrl: "./password-recovery-landing-page.component.html",
	styleUrls: ["./password-recovery-landing-page.component.scss"],
	providers: [PasswordRecoveryService]
})
export class PasswordRecoveryLandingPageComponent implements OnInit, OnDestroy {
	public formGroup: FormGroup;
	loading = false;
	error = "";
	subscription;
	private jwtHelperService = new JwtHelperService();

	constructor(private formBuilder: FormBuilder,
				private activatedRoute: ActivatedRoute,
				private snackBar: MatSnackBar,
				private loginService: LogInService,
				private router: Router,
				private passwordRecoveryService: PasswordRecoveryService) {
		this.formGroup = this.formBuilder.group({
			"password": ["", {
				validators: [Validators.required]
			}],
			"confirmedPassword": ["", {
				validators: [Validators.required]
			}]
		}, {
			validator: confirmPasswordValidator()
		});
		this.subscription = this.formGroup.valueChanges
			.pipe(filter(() => this.formGroup.valid))
			.subscribe(() => this.error = "");
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	getEmailFromToken(authToken: string): string | null {
		try {
			return this.jwtHelperService.decodeToken(authToken).sub;
		}
		catch (e) {
			this.error = "Der Authentifizierungstoken ist falsch formatiert. Überprüfe bitte den Link.";
			this.loading = false;
			return null;
		}
	}

	submit() {
		this.loading = true;
		const authToken: string = this.activatedRoute.snapshot.queryParamMap.get("auth_token");

		const email = this.getEmailFromToken(authToken);
		if (email === null) {
			return;
		}

		const password = this.formGroup.get("password").value;
		this.passwordRecoveryService.resetPassword(password, authToken)
			.pipe(
				//login with new password
				mergeMap(() => this.loginService.login(email, password)),
				tap(() => this.router.navigateByUrl("/")),
			)
			.subscribe(
				() => {
					//reset was successful
					this.loading = false;
					this.snackBar.open("Passwort wurde erfolgreich zurückgesetzt!", null, {
						duration: 1500
					})
				},
				error => {
					this.error = error.message;
					this.loading = false;
				}
			)
	}

}

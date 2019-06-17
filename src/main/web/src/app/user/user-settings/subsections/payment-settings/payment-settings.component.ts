import {Component} from "@angular/core";
import {BaseSettingsSubsectionComponent} from "../base-settings-subsection.component";
import {LogInService} from "../../../../shared/services/api/login.service";
import {AccountSettingsService} from "../account-settings.service";
import {MatSnackBar} from "@angular/material";
import {UserService} from "../../../../shared/services/api/user.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {User} from "../../../../shared/model/user";
import {forkJoin} from "rxjs";
import {UserBankAccountService} from "../../../../shared/services/api/user-bank-account.service";
import {first} from "rxjs/operators";
import {BankAccount} from "../../../../shared/model/bank-account";

@Component({
	selector: "memo-payment-settings",
	templateUrl: "./payment-settings.component.html",
	styleUrls: ["./payment-settings.component.scss"]
})
export class PaymentSettingsComponent extends BaseSettingsSubsectionComponent {
	constructor(protected loginService: LogInService,
				public accountSettingsService: AccountSettingsService,
				protected bankAccountService: UserBankAccountService,
				protected snackBar: MatSnackBar,
				private userService: UserService,
				private formBuilder: FormBuilder) {
		super(loginService, snackBar, accountSettingsService);
		this.formGroup = this.formBuilder.group({
			"bankAccounts": [[], {
				validators: []
			}],
		});

		this.init();
	}

	private previousBankAccounts: BankAccount[] = [];

	protected initFromUser(user: User, formGroup: FormGroup) {
		if (user.bankAccounts.length === 0) {
			return;
		}

		forkJoin(
			...user.bankAccounts.map(addressId => this.bankAccountService.getById(addressId))
		)
			.pipe(first())
			.subscribe(accounts => {
				this.previousBankAccounts = [...accounts];
				formGroup.get("bankAccounts").setValue(accounts)
			})
	}

	hasChanges(user: User, value: { bankAccounts: BankAccount[] }) {
		if (this.previousBankAccounts.length !== value.bankAccounts.length) {
			return true;
		}

		if (value.bankAccounts.some(newAcc => newAcc.id === -1)) {
			return true;
		}

		const anyAccountHasChanges = value.bankAccounts
			.some(newAcc => {
				const oldValue = this.previousBankAccounts.find(oldAcc => newAcc.id === oldAcc.id);
				return oldValue.name !== newAcc.name || oldValue.bic !== newAcc.bic || oldValue.iban !== newAcc.iban;
			});
		if (anyAccountHasChanges) {
			return true;
		}

		return false;
	}


	save(formGroup: FormGroup, user: User) {
		return this.bankAccountService.updateAccountsOfUser(this.previousBankAccounts, formGroup.value.bankAccounts, user);
	}
}

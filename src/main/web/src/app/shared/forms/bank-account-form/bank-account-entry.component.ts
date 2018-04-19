import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {BankAccount} from "../../model/bank-account";
import {ConfirmationDialogService} from "../../services/confirmation-dialog.service";

@Component({
	selector: "memo-bank-account-entry",
	templateUrl: "./bank-account-entry.component.html",
	styleUrls: ["./bank-account-entry.component.scss"]
})
export class BankAccountEntryComponent implements OnInit {
	@Input() account: BankAccount;

	@Output() onDelete = new EventEmitter<boolean>();
	@Output() onEdit = new EventEmitter<boolean>();

	constructor(private confirmationDialogService: ConfirmationDialogService) {
	}

	ngOnInit() {
	}

	deleteAccount() {
		this.confirmationDialogService.openDialog(
			"Wollen Sie diese Bankdaten wirklich löschen?"
		).subscribe(accepted => {
			if (accepted) {
				this.onDelete.emit(true);
			}
		})
	}
}

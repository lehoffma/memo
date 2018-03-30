import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Address} from "../../model/address";
import {ConfirmationDialogService} from "../../services/confirmation-dialog.service";

@Component({
	selector: "memo-address-entry",
	templateUrl: "./address-entry.component.html",
	styleUrls: ["./address-entry.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressEntryComponent implements OnInit {
	@Input() address: Address;

	@Output() onDelete = new EventEmitter<boolean>();
	@Output() onEdit = new EventEmitter<boolean>();

	constructor(private confirmationDialogService: ConfirmationDialogService) {
	}

	ngOnInit() {
	}

	deleteAddress() {
		this.confirmationDialogService.openDialog(
			"Wollen Sie diese Addresse wirklich löschen?"
		).subscribe(accepted => {
			if (accepted) {
				this.onDelete.emit(true);
			}
		})
	}
}

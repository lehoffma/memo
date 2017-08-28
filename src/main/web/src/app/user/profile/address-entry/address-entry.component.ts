import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Address} from "../../../shared/model/address";
import {ConfirmationDialogService} from "../../../shared/services/confirmation-dialog.service";
import {AddressService} from "../../../shared/services/api/address.service";
import {Router} from "@angular/router";

@Component({
	selector: "memo-address-entry",
	templateUrl: "./address-entry.component.html",
	styleUrls: ["./address-entry.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressEntryComponent implements OnInit {
	@Input() address: Address;
	@Input() editUrl: string;

	@Output() onDelete = new EventEmitter<boolean>();

	constructor(private confirmationDialogService: ConfirmationDialogService,
				private addressService: AddressService,
				private router: Router) {
	}

	ngOnInit() {
	}

	navigateToAddressModifications() {
		this.addressService.redirectUrl = this.router.url;
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

import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ShoppingCartOption} from "../../../../../shared/model/shopping-cart-item";
import {MatDialog} from "@angular/material/dialog";
import {NameChangeDialogComponent} from "../../name-change-dialog/name-change-dialog.component";
import {filter} from "rxjs/operators";

@Component({
	selector: "memo-cart-tour-participant",
	templateUrl: "./cart-tour-participant.component.html",
	styleUrls: ["./cart-tour-participant.component.scss"]
})
export class CartTourParticipantComponent implements OnInit {
	@Input() index: number;
	@Input() name: string;

	@Input() option: ShoppingCartOption = {isDriver: false, needsTicket: false, color: undefined, size: ""};
	@Output() optionChange: EventEmitter<ShoppingCartOption> = new EventEmitter<ShoppingCartOption>();

	@Input() set isDriver(isDriver: boolean) {
		this.option.isDriver = isDriver;
	}

	@Input() set needsTicket(needsTicket: boolean) {
		this.option.needsTicket = needsTicket;
	}

	@Output() onRemove: EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor(private matDialog: MatDialog) {
	}

	ngOnInit() {
	}

	openNameChangeDialog() {
		this.matDialog.open(NameChangeDialogComponent, {
			data: {
				name: this.option.name
			}
		})
			.afterClosed()
			.pipe(
				filter(changedOption => !!changedOption),
			)
			.subscribe(changedOption => {
				this.option.name = changedOption.name;

				this.optionChange.emit(this.option);
			})
	}
}

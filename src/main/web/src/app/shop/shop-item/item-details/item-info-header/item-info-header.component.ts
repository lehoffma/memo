import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import {Event} from "../../../shared/model/event";
import {map, mergeMap} from "rxjs/operators";
import {BehaviorSubject, Observable} from "rxjs";
import {User} from "../../../../shared/model/user";
import {LogInService} from "../../../../shared/services/api/login.service";
import {ResponsibilityService} from "../../../shared/services/responsibility.service";
import {ConfirmationDialogService} from "../../../../shared/services/confirmation-dialog.service";
import {EventService} from "../../../../shared/services/api/event.service";
import {Router} from "@angular/router";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {ErrorHandlingService} from "../../../../shared/error-handling/error-handling.service";
import {SNACKBAR_PRESETS} from "../../../../util/util";

@Component({
	selector: "memo-item-info-header",
	templateUrl: "./item-info-header.component.html",
	styleUrls: ["./item-info-header.component.scss"]
})
export class ItemInfoHeaderComponent implements OnInit {

	@Input() permissions: {
		checkIn: boolean;
		edit: boolean;
		conclude: boolean;
		orders: boolean;
		entries: boolean;
		delete: boolean;
	};
	@Output() shareEvent = new EventEmitter();
	private _event$: BehaviorSubject<Event> = new BehaviorSubject<Event>(null);
	public isMerch$ = this._event$.pipe(
		map(it => EventUtilityService.isMerchandise(it))
	);
	responsible$: Observable<User[]> = this._event$
		.pipe(mergeMap(event => this.responsibilityService.getResponsible(event.id)));

	constructor(private matDialog: MatDialog,
				private loginService: LogInService,
				private confirmationDialogService: ConfirmationDialogService,
				private eventService: EventService,
				private snackBar: MatSnackBar,
				private router: Router,
				private errorHandlingService: ErrorHandlingService,
				private responsibilityService: ResponsibilityService) {
	}

	get event() {
		return this._event$.getValue();
	}

	@Input()
	set event(event: Event) {
		this._event$.next(event);
	}

	ngOnInit() {
	}

	/**
	 * Deletes the current item, after showing a confirmation dialog
	 */
	deleteItem() {
		this.confirmationDialogService.openDialog("Möchtest du dieses Item wirklich löschen?")
			.subscribe(yes => {
				if (yes) {
					this.eventService.remove(this.event.id)
						.subscribe(
							success => {
								this.snackBar.open("Das Item wurde erfolgreich gelöscht", null, {...SNACKBAR_PRESETS.info});
								this.router.navigateByUrl("/");
							},
							error => {
								this.errorHandlingService.errorCallback(error, {
									errorMessage: "Das Item konnte nicht gelöscht werden."
								});
							}
						)
				}
			})
	}

}

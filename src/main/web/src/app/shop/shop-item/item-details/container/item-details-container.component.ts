import {Component, Input, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {MatDialog} from "@angular/material";
import {ItemImagePopupComponent} from "./image-popup/item-image-popup.component";
import {Event} from "../../../shared/model/event";
import {EventOverviewKey} from "./overview/event-overview-key";
import {LogInService} from "../../../../shared/services/api/login.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {Permission, UserPermissions} from "../../../../shared/model/permission";
import {of} from "rxjs/observable/of";
import {map, mergeMap} from "rxjs/operators";
import {ResponsibilityService} from "../../../shared/services/responsibility.service";
import {ConcludeEventService} from "../../../shared/services/conclude-event.service";
import {User} from "../../../../shared/model/user";


@Component({
	selector: "memo-item-details-container",
	templateUrl: "./item-details-container.component.html",
	styleUrls: ["./item-details-container.component.scss"]
})
export class ItemDetailsContainerComponent implements OnInit {
	@Input() event: Event;
	userCanEditEvent: Observable<boolean> = this.loginService.currentUser$
		.pipe(
			map(user => this.checkPermissions(user, Permission.write,
				u => (<any>EventUtilityService.handleShopItem(this.event,
					merch => "merch",
					tour => "tour",
					party => "party"
				))))
		);
	userCanAccessEntries$: Observable<boolean> = this.loginService.currentUser$
		.pipe(
			map(user => this.checkPermissions(user, Permission.read, _ => "funds"))
		);
	showConcludeEventHeader$: Observable<boolean> = this.loginService.currentUser$
		.pipe(
			mergeMap(user => this.checkResponsibility(user))
		);

	@Input() overviewKeys: Observable<EventOverviewKey[]> = of([]);

	constructor(private mdDialog: MatDialog,
				private responsibilityService: ResponsibilityService,
				private concludeEventService: ConcludeEventService,
				private loginService: LogInService) {
	}

	ngOnInit() {
	}

	showDetailedImage(imagePath: string) {
		this.mdDialog.open(ItemImagePopupComponent, {
			data: {
				imagePath: imagePath
			}
		})
	}

	/**
	 *
	 * @param {User} user
	 * @param minimumPermission
	 * @param getPermissionKey
	 * @returns {boolean}
	 */
	checkPermissions(user: User, minimumPermission: Permission,
					 getPermissionKey: (user: User) => keyof UserPermissions): boolean {
		if (user !== null && this.event !== null) {
			let permissions = user.userPermissions;
			let permissionKey = getPermissionKey(user);
			if (permissionKey) {
				return permissions[permissionKey] >= minimumPermission;
			}
		}

		return false;
	}

	/**
	 *
	 * @param {User} user
	 * @returns {Observable<boolean>}
	 */
	checkResponsibility(user: User): Observable<boolean> {
		if (user !== null && this.event !== null) {
			return this.concludeEventService.hasConcluded(this.event.id)
				.pipe(
					mergeMap(isConcluded => this.responsibilityService
						.isResponsible(this.event.id, user.id)
						.pipe(
							map(isResponsible => !isConcluded && isResponsible)
						)
					)
				);
		}
		return of(false);
	}
}

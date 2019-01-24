import {Component, EventEmitter, HostBinding, Inject, OnInit} from "@angular/core";
import {User, userPermissions} from "../../../model/user";
import {OverlayRef} from "@angular/cdk/overlay";
import {OVERLAY_DATA, OVERLAY_REF} from "../../../services/overlay.service";
import {OrderedItemService} from "../../../services/api/ordered-item.service";
import {Observable, of} from "rxjs";
import {map, share} from "rxjs/operators";
import {MilesService} from "../../../services/api/miles.service";
import {PageRequest} from "../../../model/api/page-request";
import {Sort} from "../../../model/api/sort";
import {ClubRole, isAuthenticated} from "../../../model/club-role";
import {Permission} from "../../../model/permission";
import {LogInService} from "../../../services/api/login.service";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
	selector: "memo-profile-preview",
	templateUrl: "./profile-preview.component.html",
	styleUrls: ["./profile-preview.component.scss"],
	animations: [
		trigger("fadeIn", [
			transition("void => *", [
				style({transform: "translateY(-5px)", opacity: "0"}),
				animate("100ms ease-in", style({transform: "translateY(0)", opacity: "1"}))
			]),
			transition("* => void", [
				style({opacity: "1"}),
				animate("100ms ease-out", style({opacity: "0"}))
			]),
		]),
	]
})
export class ProfilePreviewComponent implements OnInit {
	@HostBinding("@fadeIn") get fadeIn() {
		return true;
	}

	user: User;
	amountOfTours$: Observable<number> = of(0);
	formattedPhoneNumber: string;

	mouseIsOver = new EventEmitter<boolean>();

	miles$: Observable<number>;


	canReadPhoneNumber$: Observable<boolean> = this.loginService.currentUser$.pipe(
		map((loggedInUser) => this.user && loggedInUser && (this.user.id === loggedInUser.id ||
			userPermissions(loggedInUser).userManagement >= Permission.read ||
			isAuthenticated(loggedInUser.clubRole, ClubRole.Vorstand)))
	);

	constructor(@Inject(OVERLAY_REF) public dialogRef: OverlayRef,
				@Inject(OVERLAY_DATA) public data: any,
				private loginService: LogInService,
				private participantsService: OrderedItemService,
				private milesService: MilesService) {
		this.user = this.data.user;
		this.amountOfTours$ = this.participantsService.getParticipatedEventsOfUser(this.user.id, PageRequest.first(), Sort.none())
			.pipe(
				map(events => events.totalElements)
			);

		this.miles$ = this.milesService.get(this.user.id)
			.pipe(share(), map(entry => entry.miles));

		if (this.user.mobile) {
			this.formattedPhoneNumber = this.getFormattedPhoneNumber(this.user.mobile);
		}
	}

	ngOnInit() {
	}

	private getFormattedPhoneNumber(phoneNumber: string): string {
		return phoneNumber
		//remove white space
			.replace(/\s/g, "")
			//remove leading +
			.replace(/^\+/, "")
			//remove leading zeroes
			.replace(/^[0]*(.*)/, "$1")
	}
}

import {Component, EventEmitter, Inject, OnInit} from "@angular/core";
import {User} from "../../../model/user";
import {OverlayRef} from "@angular/cdk/overlay";
import {OVERLAY_DATA, OVERLAY_REF} from "../../../services/overlay.service";
import {OrderedItemService} from "../../../services/api/ordered-item.service";
import {Observable} from "rxjs/Observable";
import {of} from "rxjs/observable/of";
import {map, share} from "rxjs/operators";
import {MilesService} from "../../../services/api/miles.service";
import {PageRequest} from "../../../model/api/page-request";
import {Sort} from "../../../model/api/sort";

@Component({
	selector: "memo-profile-preview",
	templateUrl: "./profile-preview.component.html",
	styleUrls: ["./profile-preview.component.scss"]
})
export class ProfilePreviewComponent implements OnInit {
	user: User;
	amountOfTours$: Observable<number> = of(0);
	formattedPhoneNumber: string;

	mouseIsOver = new EventEmitter<boolean>();

	miles$: Observable<number>;

	constructor(@Inject(OVERLAY_REF) public dialogRef: OverlayRef,
				@Inject(OVERLAY_DATA) public data: any,
				private participantsService: OrderedItemService,
				private milesService: MilesService) {
		this.user = this.data.user;
		this.amountOfTours$ = this.participantsService.getParticipatedEventsOfUser(this.user.id, PageRequest.first(), Sort.none())
			.pipe(
				map(events => events.totalElements)
			);

		this.miles$ = this.milesService.get(this.user.id)
			.pipe(share(), map(entry => entry.miles));

		this.miles$
			.subscribe(it => console.log(it));

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

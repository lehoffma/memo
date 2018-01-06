import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {User} from "../../model/user";
import {ProfilePreviewComponent} from "../profile-preview/profile-preview.component";
import {OverlayService} from "../../services/overlay.service";
import {OverlayRef} from "@angular/cdk/overlay";
import {Subject} from "rxjs/Subject";
import {debounceTime, map, take} from "rxjs/operators";
import {Subscription} from "rxjs/Subscription";
import {timer} from "rxjs/observable/timer";

@Component({
	selector: 'memo-profile-link',
	templateUrl: './profile-link.component.html',
	styleUrls: ['./profile-link.component.scss']
})
export class ProfileLinkComponent implements OnInit, OnDestroy {
	@Input() user: User;
	@Input() shortened: boolean = false;
	@Input() mouseLeaveDelay: number = 300;
	@Input() hoverDelay: number = 250;

	overlayRef: OverlayRef;
	@ViewChild("profileLink") profileLink: ElementRef;

	disposeStream: Subject<boolean> = new Subject();

	subscriptions: Subscription[] = [];

	dialogIsInitialized = false;

	constructor(private overlayService: OverlayService) {
	}

	ngOnInit() {
		let disposeObservable = this.disposeStream.asObservable();
		if (this.mouseLeaveDelay > 0) {
			disposeObservable = disposeObservable
				.pipe(
					debounceTime(this.mouseLeaveDelay)
				)
		}

		this.subscriptions.push(disposeObservable
			.subscribe(value => {
				if (this.overlayRef && value) {
					this.destroyOverlay();
				}
			}));
	}

	destroyOverlay() {
		if (this.overlayRef) {
			this.overlayRef.detach();
			this.overlayRef.dispose();
			this.dialogIsInitialized = false;
		}
	}

	ngOnDestroy(): void {
		this.destroyOverlay();
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	openPreview() {
		this.disposeStream.next(false);
		if (!this.dialogIsInitialized && (!this.overlayRef || (this.overlayRef && !this.overlayRef.hasAttached()))) {
			this.dialogIsInitialized = true;
			timer(this.hoverDelay)
				.pipe(take(1))
				.subscribe(() => {
					const {overlay, component} = this.overlayService.open(this.profileLink, ProfilePreviewComponent,
						{
							user: this.user
						},
						{
							width: 250,
							height: 260
						});
					this.overlayRef = overlay;
					this.subscriptions.push(component.mouseIsOver
						.pipe(
							//negate it => if the mouse is over the component, we _dont_ want to close the dialog
							map(mouseIsOverComponent => !mouseIsOverComponent),
						)
						.subscribe(this.disposeStream)
					);
				});
		}
	}

	closePreview() {
		this.disposeStream.next(true);
	}
}

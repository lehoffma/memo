import {Directive, ElementRef, HostListener, Input, OnDestroy} from "@angular/core";
import {OverlayService} from "../../services/overlay.service";
import {debounceTime, map, take} from "rxjs/operators";
import {Subject, Subscription, timer} from "rxjs";
import {OverlayRef} from "@angular/cdk/overlay";
import {ProfilePreviewComponent} from "./profile-preview/profile-preview.component";
import {User} from "../../model/user";

@Directive({
	selector: "[memoUserPreview]"
})
export class UserPreviewDirective implements OnDestroy {
	@Input() user: User;
	@Input() mouseLeaveDelay: number = 300;
	@Input() hoverDelay: number = 250;

	overlayRef: OverlayRef;

	disposeStream: Subject<boolean> = new Subject();

	subscriptions: Subscription[] = [];

	dialogIsInitialized = false;

	clicked = false;

	constructor(private elementRef: ElementRef,
				private overlayService: OverlayService) {
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

	@HostListener("mouseenter")
	openPreview() {
		console.log("mouseenter");
		this.disposeStream.next(false);
		if (!this.dialogIsInitialized && (!this.overlayRef || (this.overlayRef && !this.overlayRef.hasAttached()))) {
			this.dialogIsInitialized = true;
			timer(this.hoverDelay)
				.pipe(take(1))
				.subscribe(() => {
					if (this.clicked) {
						return;
					}

					const {overlay, component} = this.overlayService.open(this.elementRef, ProfilePreviewComponent,
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

	@HostListener("mouseleave")
	closePreview() {
		this.disposeStream.next(true);
	}

	@HostListener("click")
	onClick() {
		this.clicked = true;
		this.closePreview();
	}

}

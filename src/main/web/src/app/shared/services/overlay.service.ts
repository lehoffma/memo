import {ComponentRef, ElementRef, Inject, Injectable, InjectionToken, Injector} from "@angular/core";
import {
	HorizontalConnectionPos,
	OriginConnectionPosition,
	Overlay,
	OverlayConfig,
	OverlayConnectionPosition,
	OverlayRef,
	VerticalConnectionPos
} from "@angular/cdk/overlay";
import {ComponentPortal, ComponentType, PortalInjector} from "@angular/cdk/portal";
import {isNumber} from "../../util/util";
import {WindowService} from "./window.service";
import {DOCUMENT} from "@angular/common";
import {ScrollingService} from "./scrolling.service";

export const OVERLAY_REF = new InjectionToken<OverlayRef>("OVERLAY_REF");
export const OVERLAY_DATA = new InjectionToken<any>("OVERLAY_DATA");

export type OverlayPosition = {
	originX: HorizontalConnectionPos,
	originY: VerticalConnectionPos,
	overlayX: HorizontalConnectionPos,
	overlayY: VerticalConnectionPos
};

@Injectable()
export class OverlayService {
	readonly DEFAULT_POSITION: OverlayPosition = {
		//start --  center -- end
		//  X   -- [  X  ] --  X
		originX: "end",
		//	X		top
		//  |
		// [X]		center
		//  |
		//  X		bottom
		originY: "center",
		//start --  center -- end
		//  X   -- [  X  ] --  X
		overlayX: "start",
		//	X		top
		//  |
		// [X]		center
		//  |
		//  X		bottom
		overlayY: "top"
	};

	constructor(private overlay: Overlay,
				private windowService: WindowService,
				@Inject(DOCUMENT) private document: Document,
				private scrollingService: ScrollingService,
				private injector: Injector) {
	}

	get DEFAULT_CONFIG(): OverlayConfig {
		return {
			hasBackdrop: false,
			scrollStrategy: this.overlay.scrollStrategies.reposition({
				autoClose: true
			}),
			width: 250
		}
	};

	/**
	 *
	 * @param {ElementRef} attachedTo
	 * @param {ComponentType<T>} component
	 * @param data
	 * @param {OverlayConfig} config
	 * @returns {OverlayRef}
	 */
	open<T>(attachedTo: ElementRef, component: ComponentType<T>, data?: any, config?: OverlayConfig): {
		component: T,
		overlay: OverlayRef
	} {
		const overlayRef: OverlayRef = this.overlay.create(this.getOverlayConfig(attachedTo, config));

		const attachedComponent = this.attachDialogContainer(overlayRef, component, data);

		return {
			component: attachedComponent,
			overlay: overlayRef
		};
	}

	/**
	 *
	 * @param data
	 * @param {OverlayRef} dialogRef
	 * @returns {PortalInjector}
	 */
	private createInjector(data: any, dialogRef: OverlayRef): PortalInjector {
		// Instantiate new WeakMap for our custom injection tokens
		const injectionTokens = new WeakMap();

		// Set custom injection tokens
		injectionTokens.set(OVERLAY_REF, dialogRef);
		injectionTokens.set(OVERLAY_DATA, data);

		// Instantiate new PortalInjector
		return new PortalInjector(this.injector, injectionTokens);
	}

	/**
	 *
	 * @param {OverlayRef} overlayRef
	 * @param {ComponentType<T>} component
	 * @param data
	 * @returns {T}
	 */
	private attachDialogContainer<T>(overlayRef: OverlayRef,
									 component: ComponentType<T>,
									 data: any): T {
		const injector = this.createInjector(data, overlayRef);

		const containerPortal = new ComponentPortal(component, null, injector);
		const containerRef: ComponentRef<T> = overlayRef.attach(containerPortal);

		return containerRef.instance;
	}

	private getDirection(element: HTMLElement, config?: OverlayConfig): {
		originPos: OriginConnectionPosition,
		overlayPos: OverlayConnectionPosition
	} {
		//default: to the right of the element, centered on the y axis
		let {originX, originY, overlayX, overlayY} = this.DEFAULT_POSITION;

		const overlayWidth: string | number = (config && config.width) ? config.width : this.DEFAULT_CONFIG.width;
		const elementX = element.offsetLeft;
		const elementY = element.offsetTop;
		const elementWidth = element.offsetWidth;
		const elementHeight = element.offsetHeight;

		if (isNumber(overlayWidth)) {
			//element is too far to the right => wrap to the left
			if ((elementX + elementWidth + overlayWidth) > this.windowService.dimensions.width) {
				originX = "start";
				overlayX = "end";
			}
		}
		const overlayHeight: string | number = (config && config.height) ? config.height : this.DEFAULT_CONFIG.height;
		if (isNumber(overlayHeight)) {
			const scrolledPixels = this.scrollingService.scrollTop;
			//element's height causes it to be lower than the bottom of the screen
			//	=> move to the top of the reference element
			if ((elementY + elementHeight / 2 + overlayHeight) > (this.windowService.dimensions.height + scrolledPixels)) {
				originY = "top";
				overlayY = "bottom";
			}
		}


		return {originPos: {originX, originY}, overlayPos: {overlayX, overlayY}};
	}

	/**
	 *
	 * @param {ElementRef} attachedTo
	 * @param {OverlayConfig} config
	 * @returns {{positionStrategy?: PositionStrategy; scrollStrategy?: ScrollStrategy; panelClass?: string | string[]; hasBackdrop?: boolean; backdropClass?: string; width?: number | string; height?: number | string; minWidth?: number | string; minHeight?: number | string; maxWidth?: number | string; maxHeight?: number | string; direction?: Direction; positionStrategy?: PositionStrategy; positionStrategy?: PositionStrategy; scrollStrategy?: ScrollStrategy; panelClass?: string | string[]; hasBackdrop?: boolean; backdropClass?: string; width?: number | string; height?: number | string; minWidth?: number | string; minHeight?: number | string; maxWidth?: number | string; maxHeight?: number | string; direction?: Direction}}
	 */
	private getOverlayConfig(attachedTo: ElementRef, config?: OverlayConfig) {
		const element: HTMLElement = attachedTo.nativeElement;
		const {originPos, overlayPos} = this.getDirection(element, config);

		return {
			...this.DEFAULT_CONFIG,
			// default: attached to the given element ref
			positionStrategy: this.overlay.position()
				.connectedTo(attachedTo, originPos, overlayPos),
			...config,
		};
	}
}

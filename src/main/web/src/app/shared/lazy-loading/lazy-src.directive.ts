import {Directive, ElementRef, OnDestroy, OnInit, Renderer2} from "@angular/core";
import {LazyTarget, LazyViewport} from "./lazy-viewport";

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //
@Directive({
	selector: "[lazySrc]",
	inputs: [
		"src: lazySrc",
		"visibleClass: lazySrcVisible"
	]
})
export class LazySrcDirective implements OnInit, OnDestroy, LazyTarget {

	public element: Element;
	public src: string;
	public visibleClass: string = "visible";

	private lazyViewport: LazyViewport;
	private renderer: Renderer2;

	// I initialize the lazy-src directive.
	constructor(
		elementRef: ElementRef,
		lazyViewport: LazyViewport,
		renderer: Renderer2
	) {
		this.element = elementRef.nativeElement;
		this.lazyViewport = lazyViewport;
		this.renderer = renderer;

		this.src = "";
		this.visibleClass = "";

	}

	public ngOnDestroy(): void {
		if (this.lazyViewport) {
			this.lazyViewport.removeTarget(this)
		}
	}

	public ngOnInit(): void {
		this.lazyViewport.addTarget(this);
	}


	public updateVisibility(isVisible: boolean, ratio: number): void {
		// When this target starts being tracked by the viewport, the initial visibility
		// will be reported, even if it is not visible. As such, let's ignore the first
		// visibility update.
		if (!isVisible) {
			return;
		}

		// Now that the element is visible, load the underlying SRC value. And, since we
		// no longer need to worry about loading, we can detach from the LazyViewport.
		this.lazyViewport.removeTarget(this);
		this.lazyViewport = null;
		this.renderer.setProperty(this.element, "src", this.src);

		// If an active class has been provided, add it to the element.
		if (this.visibleClass) {
			this.renderer.addClass(this.element, this.visibleClass);
		}
	}

}

import {AfterContentChecked, Directive, ElementRef, HostListener, OnInit, Renderer2} from "@angular/core";

@Directive({selector: "textarea[autosize]"})
export class AutoSizeTextAreaDirective implements OnInit, AfterContentChecked {
	constructor(public elementRef: ElementRef, public renderer: Renderer2) {
	}

	ngOnInit() {
	}

	ngAfterContentChecked(): void {
		this.elementRef.nativeElement.style.overflow = "hidden";
		this.elementRef.nativeElement.style.height = "auto";
		this.updateSize();
	}


	@HostListener("input", ["$event.target"])
	onInput(textArea: HTMLInputElement) {
		this.updateSize();
	}

	updateSize() {
		this.renderer.setStyle(this.elementRef.nativeElement, "height", this.elementRef.nativeElement.scrollHeight + "px");
		// this.elementRef.nativeElement.height = this.elementRef.nativeElement.scrollHeight + "px";
	}
}

import {ChangeDetectorRef, Directive, ElementRef, Input, OnDestroy} from "@angular/core";
import {filter, mergeMap, takeUntil} from "rxjs/operators";
import {ImageLazyLoadService} from "./image-lazy-load.service";
import {WindowService} from "../services/window.service";
import {BehaviorSubject, combineLatest, Subject} from "rxjs";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Directive({
	selector: "img [memoProgressiveImageSrc]",
	host: {
		"style.transition": "0.4s filter ease-in",
		"[style.filter]": "hasBeenLoadedOnce ? blur0 : blurFull",
		"[src]": "hasBeenLoadedOnce ? fullyLoadedImage : fallbackImage"
	},
})
export class ProgressiveImageSrcDirective implements OnDestroy {
	blur0 = this.domSanitizer.bypassSecurityTrustStyle("blur(0)");
	blurFull = this.domSanitizer.bypassSecurityTrustStyle("blur(10px)");

	_imageSrc$: BehaviorSubject<string> = new BehaviorSubject(null);

	@Input("progressiveImageSrc") set imageSrc(imageSrc: string) {
		this._imageSrc$.next(imageSrc);
	}

	get imageSrc() {
		return this._imageSrc$.getValue();
	}

	@Input("fallbackImage") fallbackImage: string;

	public hasBeenLoadedOnce$: BehaviorSubject<boolean> = new BehaviorSubject(false);

	get hasBeenLoadedOnce() {
		return this.hasBeenLoadedOnce$.getValue();
	}

	get fullyLoadedImage() {
		return this.fullyLoadedImage$.getValue();
	}

	fullyLoadedImage$: BehaviorSubject<SafeUrl> = new BehaviorSubject(null);

	onDestroy$ = new Subject();

	constructor(private elementRef: ElementRef,
				private cdRef: ChangeDetectorRef,
				private domSanitizer: DomSanitizer,
				private imageLazyLoadService: ImageLazyLoadService,
				private windowService: WindowService,) {
		this.hasBeenLoadedOnce$.pipe(takeUntil(this.onDestroy$))
			.subscribe(it => {
				setTimeout(() => {
					this.cdRef.detectChanges()
				}, 100);
			});

		combineLatest([
			this._imageSrc$,
			this.windowService.dimension$
		]).pipe(takeUntil(this.onDestroy$)).subscribe(([imageSrc, dimensions]) => {
			this.imageLazyLoadService.hasBeenLoaded(imageSrc, dimensions);
		});

		combineLatest([
			this._imageSrc$.pipe(filter(it => it !== null)),
			this.windowService.dimension$
		])
			.pipe(
				mergeMap(([imageSrc, dimensions]) => this.imageLazyLoadService.getImage(imageSrc, dimensions)),
				takeUntil(this.onDestroy$),
			)
			.subscribe(it => this.fullyLoadedImage$.next(it));

		this.fullyLoadedImage$.pipe(filter(it => it !== null), takeUntil(this.onDestroy$))
			.subscribe((image) => {
				this.hasBeenLoadedOnce$.next(true);
			});
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

}

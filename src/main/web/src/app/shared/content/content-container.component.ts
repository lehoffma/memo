import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {WindowService} from "../services/window.service";
import {BehaviorSubject, Subject} from "rxjs";
import {switchMap, takeUntil} from "rxjs/operators";


@Component({
	selector: "memo-form-container,memo-content-container",
	templateUrl: "./content-container.component.html",
	styleUrls: ["./content-container.component.scss"],
})
export class ContentContainerComponent implements OnInit, OnDestroy {
	@Input() title: string = "";
	@Input() subtitle: string = "";
	@Input() route: string;

	@Input() direction: "vertical" | "horizontal";
	automaticDirection: "vertical" | "horizontal";

	minHorizontalWidth$ = new BehaviorSubject(800);

	@Input() set minHorizontalWidth(width: number) {
		this.minHorizontalWidth$.next(width);
	}

	onDestroy$ = new Subject();

	constructor(protected windowService: WindowService) {
		this.minHorizontalWidth$.pipe(
			switchMap(width => this.windowService.hasMinDimensions(width)),
			takeUntil(this.onDestroy$)
		)
			.subscribe(isDesktop => this.automaticDirection = isDesktop ? "horizontal" : "vertical")
	}

	ngOnInit() {

	}

	ngOnDestroy(): void {
	}
}


@Component({
	selector: "memo-simple-content-container",
	templateUrl: "./content-container.component.html",
	styleUrls: ["./content-container.component.scss"],
})
export class SimpleContentContainerComponent extends ContentContainerComponent {
	@Input() title: string;
	@Input() subtitle: string;
	@Input() route: string;

	constructor(protected windowService: WindowService) {
		super(windowService);
		this.direction = "vertical";
	}
}

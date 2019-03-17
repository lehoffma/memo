import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild} from "@angular/core";
import {animate, style, transition, trigger} from "@angular/animations";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {WindowService} from "../../../../shared/services/window.service";
import {map, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {QueryParameterService} from "../../../../shared/services/query-parameter.service";
import {Router} from "@angular/router";

export enum SearchInputState {
	ACTIVE = <any>"active",
	INACTIVE = <any>"inactive"
}

@Component({
	selector: "memo-search-input",
	templateUrl: "./search-input.component.html",
	styleUrls: ["./search-input.component.scss"],
	animations: [
		trigger("searchInputState", [
			transition("void => desktop", [
				style({width: "0", opacity: "0"}),
				animate("100ms ease-in", style({width: "*", opacity: "1"}))
			]),
			transition("desktop => void", [
				style({width: "*", opacity: "1"}),
				animate("100ms ease-out", style({width: "0", opacity: "0"}))
			]),
		]),
	]
})
export class SearchInputComponent implements OnInit, OnDestroy {
	searchInputState = SearchInputState;
	inputState = SearchInputState.INACTIVE;
	showClear = false;
	model = {
		searchInput: ""
	};


	@ViewChild("searchInput") searchInput: any;
	@Input() mobileExpanded = false;
	@Output() onFocus: EventEmitter<boolean> = new EventEmitter();


	screenState$ = this.windowService.dimension$
		.pipe(
			map(dim => dim.width < 600 ? "mobile" : "desktop")
		);

	state: "mobile" | "desktop";
	onDestroy$ = new Subject();

	constructor(private navigationService: NavigationService,
				private router: Router,
				private windowService: WindowService,
				private renderer: Renderer2) {
		this.screenState$.pipe(takeUntil(this.onDestroy$))
			.subscribe(state => {
				this.state = state as "mobile" | "desktop";
				this.inputState = state === "desktop" ? SearchInputState.ACTIVE : SearchInputState.INACTIVE;
			});
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}


	toggleInputState() {
		this.inputState = this.inputState === SearchInputState.INACTIVE
			? SearchInputState.ACTIVE
			: SearchInputState.INACTIVE;
		if (this.inputState === SearchInputState.ACTIVE) {
			this.onFocus.emit(true);
			setTimeout(() => {
				this.renderer.selectRootElement("#searchInput").focus();
			}, 300);
		} else {
			this.onFocus.emit(false);
		}
	}

	onSearch() {
		const currentParams = this.navigationService.queryParams$.getValue();
		const updatedParams = QueryParameterService.updateQueryParams(currentParams, {searchTerm: this.model.searchInput ? this.model.searchInput : null});

		this.router.navigate(["shop", "search"], {queryParams: updatedParams});
		if (this.state === "mobile") {
			this.toggleInputState();
		}
	}

	submit() {
		if (this.state === "mobile") {
			if (this.inputState === SearchInputState.INACTIVE) {
				this.toggleInputState();
			} else {
				this.onSearch();
			}
		} else {
			this.onSearch();
		}
	}
}

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild} from "@angular/core";
import {animate, style, transition, trigger} from "@angular/animations";
import {NavigationService} from "../../services/navigation.service";
import {WindowService} from "../../services/window.service";
import {map, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";

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

	@Input() set value(value: string) {
		console.log(value);
		if (!value) {
			return;
		}
		this.formGroup.get("search").setValue(value);
	}

	formGroup = this.fb.group({
		search: this.fb.control("")
	});


	@ViewChild("searchInput", { static: false }) searchInput: any;
	@Input() placeholder = "Suche";
	@Input() mobileExpanded = false;
	@Output() onFocus: EventEmitter<boolean> = new EventEmitter();
	@Output() search: EventEmitter<string> = new EventEmitter();


	screenState$ = this.windowService.dimension$
		.pipe(
			map(dim => dim.width < 600 ? "mobile" : "desktop")
		);

	state: "mobile" | "desktop";
	onDestroy$ = new Subject();

	constructor(private navigationService: NavigationService,
				private router: Router,
				private fb: FormBuilder,
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
		this.search.emit(this.formGroup.value.search);
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

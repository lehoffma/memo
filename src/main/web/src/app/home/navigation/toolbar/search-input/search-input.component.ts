import {Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild} from "@angular/core";
import {animate, style, transition, trigger} from "@angular/animations";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {WindowService} from "../../../../shared/services/window.service";
import {map} from "rxjs/operators";

export enum SearchInputState {
	ACTIVE = <any> "active",
	INACTIVE = <any> "inactive"
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
export class SearchInputComponent implements OnInit {
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

	constructor(private navigationService: NavigationService,
				private windowService: WindowService,
				private renderer: Renderer2) {
	}

	ngOnInit() {
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
		}
		else {
			this.onFocus.emit(false);
		}
	}

	onSearch() {
		if (this.inputState === SearchInputState.ACTIVE) {
			this.takeToPage("/search?searchTerm=" + this.model.searchInput);
			this.toggleInputState();
		}
	}

	takeToPage(url: string) {
		this.navigationService.navigateByUrl(url);
	}
}

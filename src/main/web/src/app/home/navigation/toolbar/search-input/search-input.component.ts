import {Component, EventEmitter, OnInit, Output, Renderer, ViewChild} from "@angular/core";
import {animate, style, transition, trigger} from "@angular/animations";
import {NavigationService} from "../../../../shared/services/navigation.service";

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
			transition(":enter", [
				style({width: "0", opacity: "0"}),
				animate("200ms ease-in", style({width: "*", opacity: "1"}))
			]),
			transition(":leave", [
				style({width: "*", opacity: "1"}),
				animate("200ms ease-out", style({width: "0", opacity: "0"}))
			]),
		])
	]
})
export class SearchInputComponent implements OnInit {
	searchInputState = SearchInputState;
	inputState = SearchInputState.INACTIVE;
	showClear = false;
	@ViewChild("searchInput") searchInput: any;

	model = {
		searchInput: ""
	};

	@Output() onFocus:EventEmitter<boolean> = new EventEmitter();

	constructor(private navigationService: NavigationService,
				private renderer: Renderer) {
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
				this.renderer.invokeElementMethod(this.searchInput.nativeElement, "focus");
			}, 300);
		}
		else{
			this.onFocus.emit(false);
		}
	}

	onSearch() {
		if (this.inputState === SearchInputState.ACTIVE) {
			this.takeToPage("/search?keywords=" + this.model.searchInput);
			this.toggleInputState();
		}
	}

	takeToPage(url: string) {
		this.navigationService.navigateByUrl(url);
	}
}

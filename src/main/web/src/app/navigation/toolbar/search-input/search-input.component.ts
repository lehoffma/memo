import {Component, OnInit, Renderer, ViewChild} from "@angular/core";
import {NavigationService} from "../../../shared/services/navigation.service";
import {animate, state, style, transition, trigger} from "@angular/animations";

export enum SearchInputState{
	ACTIVE = <any> "active",
	INACTIVE = <any> "inactive"
}

@Component({
	selector: "memo-search-input",
	templateUrl: "./search-input.component.html",
	styleUrls: ["./search-input.component.scss"],
	animations: [
		trigger("searchInputState", [
			state("active", style({
				width: "200px"
			})),
			transition(":enter", [
				style({width: "0", opacity: "0"}),
				animate("200ms ease-in", style({width: "200px", opacity: "1"}))
			]),
			transition(":leave", [
				style({width: "200px", opacity: "1"}),
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
			setTimeout(() => {
				this.renderer.invokeElementMethod(this.searchInput.nativeElement, "focus");
			}, 300);
		}
	}

	onSearch() {
		if (this.inputState === SearchInputState.ACTIVE) {
			this.takeToPage("/search?term=" + this.model.searchInput);
			this.toggleInputState();
		}
	}

	takeToPage(url: string) {
		this.navigationService.navigateByUrl(url);
	}
}

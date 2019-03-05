import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {SortingOption, SortingOptionHelper} from "../../model/sorting-option";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {QueryParameterService} from "../../services/query-parameter.service";
import {distinctUntilChanged, first, map, takeUntil} from "rxjs/operators";
import {Sort} from "../../model/api/sort";
import {BehaviorSubject, Subject} from "rxjs";

@Component({
	selector: "memo-sorting-dropdown",
	templateUrl: "./sorting-dropdown.component.html",
	styleUrls: ["./sorting-dropdown.component.scss"]
})
export class SortingDropdownComponent implements OnInit, OnDestroy {
	noneSortingOption: SortingOption<any> = SortingOptionHelper.build(
		"Unsortiert",
		Sort.none()
	);

	@Input() sortingOptions: SortingOption<any>[];

	_defaultOption = this.noneSortingOption;
	@Input() set defaultOption(option: SortingOption<any>) {
		if (option) {
			this._defaultOption = option;
		}
	};

	get defaultOption() {
		return this._defaultOption;
	}

	@Input() withoutUnsorted = false;
	selectedOption$: BehaviorSubject<string> = new BehaviorSubject("");
	combinedOptions = [];

	@Output() selectionChange: EventEmitter<string> = new EventEmitter();

	onDestroy$ = new Subject();

	constructor(private router: Router,
				private activatedRoute: ActivatedRoute) {
	}


	ngOnInit() {
		this.selectedOption$.pipe(distinctUntilChanged(), takeUntil(this.onDestroy$))
			.subscribe(option => this.selectionChange.emit(option));

		this.activatedRoute.queryParamMap
			.pipe(takeUntil(this.onDestroy$))
			.subscribe(queryParamMap => {
				let selectedOption = "";
				const somethingMatched = this.sortingOptions.some(option => {
					const optionKeys = Object.keys(option.queryParameters);

					if (optionKeys.every(key => queryParamMap.has(key))
						&& optionKeys.every(key => queryParamMap.get(key) === option.queryParameters[key])) {
						selectedOption = option.name;
					}

					return selectedOption !== "";
				});
				this.selectedOption$.next(somethingMatched ? selectedOption : this.defaultOption.name);
			});

		this.combinedOptions = this.withoutUnsorted ? [...this.sortingOptions] : [this.noneSortingOption, ...this.sortingOptions];
	}

	updateQueryParams(queryParams: Params) {
		this.activatedRoute.queryParamMap
			.pipe(
				first(),
				map(paramMap => QueryParameterService.updateQueryParams(paramMap, queryParams)),
			)
			.subscribe(newQueryParams => this.router.navigate([], {queryParams: newQueryParams}));
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}
}

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {SortingOption, SortingOptionHelper} from "../../model/sorting-option";
import {ActivatedRoute, Router} from "@angular/router";
import {QueryParameterService} from "../../services/query-parameter.service";
import {distinctUntilChanged, first, map, takeUntil} from "rxjs/operators";
import {Direction, Sort} from "../../model/api/sort";
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
	selectedOption$: BehaviorSubject<SortingOption<any>> = new BehaviorSubject(this.noneSortingOption);
	combinedOptions = [];

	@Output() selectionChange: EventEmitter<string> = new EventEmitter();

	onDestroy$ = new Subject();

	constructor(private router: Router,
				private activatedRoute: ActivatedRoute) {
	}


	ngOnInit() {
		this.selectedOption$.pipe(distinctUntilChanged(), takeUntil(this.onDestroy$))
			.subscribe(option => this.selectionChange.emit(option.name));

		this.activatedRoute.queryParamMap
			.pipe(takeUntil(this.onDestroy$))
			.subscribe(queryParamMap => {
				let selectedOption = this.defaultOption;
				const somethingMatched = this.sortingOptions.some(option => {
					const optionKeys = Object.keys(option.queryParameters);

					if (optionKeys.every(key => queryParamMap.has(key))
						&& optionKeys.every(key => queryParamMap.get(key) === option.queryParameters[key])) {
						selectedOption = option;
					}

					return selectedOption.name !== this.defaultOption.name;
				});
				this.selectedOption$.next(selectedOption);
			});

		this.combinedOptions = this.withoutUnsorted ? [...this.sortingOptions] : [this.noneSortingOption, ...this.sortingOptions];
	}

	updateQueryParams(sortingOption: SortingOption<any>) {
		let queryParams = sortingOption.queryParameters;

		if (sortingOption.queryParameters["direction"] === Direction.NONE) {
			queryParams = Object.keys(queryParams).reduce((acc, key) => {
				acc[key] = null;
				return acc;
			}, queryParams)
		}

		this.activatedRoute.queryParams
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

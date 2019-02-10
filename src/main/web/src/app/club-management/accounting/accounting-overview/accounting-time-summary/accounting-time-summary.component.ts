import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs";
import {DatePreview} from "../../../../shared/model/accounting-state";
import {endOfMonth, endOfYear, getYear, startOfMonth, startOfYear} from "date-fns";
import {EntryService} from "../../../../shared/services/api/entry.service";
import {FormBuilder} from "@angular/forms";
import {ActivatedRoute, ParamMap, Params, Router} from "@angular/router";
import {debounceTime, distinctUntilChanged, startWith, takeUntil} from "rxjs/operators";

@Component({
	selector: "memo-accounting-time-summary",
	templateUrl: "./accounting-time-summary.component.html",
	styleUrls: ["./accounting-time-summary.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountingTimeSummaryComponent implements OnInit, OnDestroy {

	datePreviews$: BehaviorSubject<DatePreview[]> = new BehaviorSubject([]);
	timeOptions = [
		{label: "Monat", value: "month"},
		{label: "Jahr", value: "year"}
	];

	yearOptions = this.getYearOptions();

	formGroup = this.formBuilder.group({
		timespan: "month",
		year: getYear(new Date())
	});

	onDestroy$ = new Subject();

	loading = true;


	constructor(private entryService: EntryService,
				private activatedRoute: ActivatedRoute,
				private router: Router,
				private formBuilder: FormBuilder) {
		this.activatedRoute.queryParamMap.pipe(takeUntil(this.onDestroy$)).subscribe((paramMap: ParamMap) => {
			this.formGroup.setValue({
				timespan: paramMap.get("timespan") || "month",
				year: +paramMap.get("year") || +getYear(new Date())
			})
		});

		let noQueryParams = this.activatedRoute.snapshot.queryParamMap.keys.length === 0;
		this.formGroup.valueChanges
			.pipe(
				startWith(this.formGroup.value),
				distinctUntilChanged(),
				debounceTime(200),
				takeUntil(this.onDestroy$)
			)
			.subscribe(value => {
				this.router.navigate([], {queryParams: {...value}, replaceUrl: noQueryParams});
				this.updateSummaries(value);
			});


	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

	public getDetailParams(date: Date, isMonth: boolean): Params {
		return {
			"minDate": (isMonth ? startOfMonth(date) : startOfYear(date)).toISOString(),
			"maxDate": (isMonth ? endOfMonth(date) : endOfYear(date)).toISOString()
		}
	}


	updateSummaries(value: { timespan: "month" | "year", year: number }) {
		this.loading = true;

		this.entryService.getTimespanSummaries(value.timespan, value.year)
			.subscribe(summaries => {
				this.datePreviews$.next(summaries);
				this.loading = false;
			})
	}

	getYearOptions() {
		const FOUNDING_YEAR = 2014;
		const currentYear = getYear(new Date());
		const options = [];
		for (let i = FOUNDING_YEAR; i <= currentYear; i++) {
			options.push({label: i, value: i})
		}
		return options;
	}

}

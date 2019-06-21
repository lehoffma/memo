import {Component, OnInit} from "@angular/core";
import {EntryService} from "../../../shared/services/api/entry.service";
import {Observable, of} from "rxjs";
import {AccountingState} from "../../../shared/model/accounting-state";
import {endOfMonth, format, isBefore, startOfMonth} from "date-fns";
import {Params, Router} from "@angular/router";
import {catchError, map, share} from "rxjs/operators";

import * as deLocale from "date-fns/locale/de";
import * as shape from "d3-shape";
import {flatMap} from "../../../util/util";

@Component({
	selector: "memo-accounting-overview",
	templateUrl: "./accounting-overview.component.html",
	styleUrls: ["./accounting-overview.component.scss"]
})
export class AccountingOverviewComponent implements OnInit {
	curve = shape.curveMonotoneX;
	error: any;
	state$: Observable<AccountingState> = this.entryService.getState().pipe(
		share(),
		catchError(error => {
			this.error = error;
			return of(null);
		})
	);

	expensesByCategory$ = this.state$.pipe(map(state => this.toPieChart(state.expensesByCategory)));
	incomeByCategory$ = this.state$.pipe(map(state => this.toPieChart(state.incomeByCategory)));
	totalOverTime$ = this.state$.pipe(map(state => this.toLineChart(state.monthlyChanges)));

	customColors: { name: string; value: string }[] = [
		{name: "Verpflegung", value: "#FFC107"},
		{name: "Tickets", value: "#43a047"},
		{name: "Mietkosten", value: "#d32f2f"},
		{name: "Steuern", value: "#3f51b5"},
		{name: "Sonstiges", value: "#9E9E9E"},
	];

	lineChartCustomColors = [
		{name: "Kontostand", value: "#43a047"}
	];

	renderMoney(input: number): string {
		return input.toFixed(2) + " €";
	}

	categoriesAreEmpty(categories: { name: string; value: number }[]): boolean {
		return categories === null || categories.reduce((acc, category) => acc + category.value, 0) === 0;
	}

	getYMax(series: { name: string, series: { name: string, value: number }[] }[]): number {
		return Math.max(
			...flatMap(val => val.series, series)
				.map(serie => serie.value),
			//take 100 as minimum
			100
		);
	}

	constructor(private entryService: EntryService,
				private router: Router) {
	}

	ngOnInit() {
	}


	public getMonthDetailParams(date: Date): Params {
		return {
			"minDate": startOfMonth(date).toISOString(),
			"maxDate": endOfMonth(date).toISOString()
		}
	}

	public getItemDetailParams(itemId: number): Params {
		return {
			"eventId": itemId,
		}
	}

	toLineChart(monthlyValues: { totalBalance: number, month: Date }[]): { name: string, series: { name: string, value: number }[] }[] {
		const summedMonthlyValues = monthlyValues
			.sort((a, b) => isBefore(a.month, b.month) ? -1 : 1)
			.reduce((acc, monthly) => {
				let sum = 0;
				if (acc.length > 0) {
					sum = acc[acc.length - 1].sum;
				}
				sum += monthly.totalBalance;

				acc.push({sum, name: format(monthly.month, "MMM", {locale: deLocale})});

				return acc;
			}, []);

		return [{
			name: "Kontostand",
			series: summedMonthlyValues
				.map(it => ({
					name: it.name,
					value: it.sum
				}))
		}]
	}

	toPieChart(byCategory: { [p: string]: number }): { name: string, value: number }[] {
		return Object.keys(byCategory).reduce((acc, key) => {
			acc.push({name: key, value: byCategory[key]});
			return acc;
		}, []);
	}

	showCostsByCategory(event: any) {
		//?entryType=Verpflegung
		const selected = (event.name !== undefined) ? event.name : event;
		this.router.navigate(["management", "costs"], {queryParams: {entryType: selected}});
	}
}

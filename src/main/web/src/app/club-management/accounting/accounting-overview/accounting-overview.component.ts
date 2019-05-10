import {Component, OnInit} from "@angular/core";
import {EntryService} from "../../../shared/services/api/entry.service";
import {Observable, of} from "rxjs";
import {AccountingState} from "../../../shared/model/accounting-state";
import {endOfMonth, format, isBefore, startOfMonth, subMonths} from "date-fns";
import {Params} from "@angular/router";
import {map} from "rxjs/operators";

import * as shape from 'd3-shape';

@Component({
	selector: "memo-accounting-overview",
	templateUrl: "./accounting-overview.component.html",
	styleUrls: ["./accounting-overview.component.scss"]
})
export class AccountingOverviewComponent implements OnInit {
	curve = shape.curveBasis;

	// state$: Observable<AccountingState> = this.entryService.getState();
	state$: Observable<AccountingState> = of({
		timestamp: new Date(),
		currentBalance: 5000.76,
		lastMonthChange: 250.22,
		tourTotal: 2512.22,
		tourChange: -200.50,
		partyTotal: -250.22,
		partyChange: 125.00,
		merchTotal: 0.00,
		merchChange: 20.00,
		itemTotals: [
			{
				itemId: 1,
				itemTitle: "Tolle Weihnachtsfahrt nach Nürnberg",
				totalBalance: 350.00
			},
			{
				itemId: 2,
				itemTitle: "Langweilige Tour nach Freiburg",
				totalBalance: -500.25
			}
		],
		monthlyChanges: [
			{
				totalBalance: 100.203,
				month: subMonths(startOfMonth(new Date()), 1)
			},
			{
				totalBalance: 205.22,
				month: subMonths(startOfMonth(new Date()), 2)
			},
			{
				totalBalance: -500.44,
				month: subMonths(startOfMonth(new Date()), 3)
			},
			{
				totalBalance: 0,
				month: subMonths(startOfMonth(new Date()), 4)
			},
			{
				totalBalance: 1252,
				month: subMonths(startOfMonth(new Date()), 5)
			},
			{
				totalBalance: -205,
				month: subMonths(startOfMonth(new Date()), 6)
			},
			{
				totalBalance: 100,
				month: subMonths(startOfMonth(new Date()), 7)
			},
			{
				totalBalance: -200,
				month: subMonths(startOfMonth(new Date()), 8)
			}
		],
		expensesByCategory: {
			"Verpflegung": 100,
			"Tickets": 155,
			"Mietkosten": 750,
			"Steuern": 100,
			"Sonstiges": 0
		},
		incomeByCategory: {
			"Verpflegung": 0,
			"Tickets": 822.50,
			"Mietkosten": 100,
			"Steuern": 540,
			"Sonstiges": 300
		},
	});

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
		{name: "Einnahmen", value: "#43a047"}
	];

	constructor(private entryService: EntryService) {
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

				acc.push({sum, name: format(monthly.month, "MMM")});

				return acc;
			}, []);

		console.log(summedMonthlyValues);

		return [{
			name: "Einnahmen",
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
}

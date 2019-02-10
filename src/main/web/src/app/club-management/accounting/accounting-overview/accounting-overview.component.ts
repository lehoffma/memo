import {Component, OnInit} from "@angular/core";
import {EntryService} from "../../../shared/services/api/entry.service";
import {Observable, of} from "rxjs";
import {AccountingState} from "../../../shared/model/accounting-state";
import {endOfMonth, startOfMonth, subMonths} from "date-fns";
import {Params} from "@angular/router";

@Component({
	selector: "memo-accounting-overview",
	templateUrl: "./accounting-overview.component.html",
	styleUrls: ["./accounting-overview.component.scss"]
})
export class AccountingOverviewComponent implements OnInit {

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
			}
		]
	});

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
}

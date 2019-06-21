import {ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {addDays, format, isBefore, setHours, setMilliseconds, setMinutes, setSeconds, subMonths, subYears} from "date-fns";
import {dateWithCorrectTimezone, NOW} from "../../../util/util";
import * as deLocale from "date-fns/locale/de";
import * as shape from 'd3-shape';

export type OverTimeData = { timestamp: string, amount: number };

export type LineChartData = { name: string, series: { name: string, value: number }[] }[]

@Component({
	selector: "memo-orders-over-time-chart",
	templateUrl: "./orders-over-time-chart.component.html",
	styleUrls: ["./orders-over-time-chart.component.scss"]
})
export class OrdersOverTimeChartComponent implements OnInit {
	curve = shape.curveMonotoneX;

	@Input() startDate: Date = subMonths(dateWithCorrectTimezone(this.startOfDay(NOW)), 1);
	@Input() endDate: Date = dateWithCorrectTimezone(this.startOfDay(NOW));

	private startOfDay(date: Date): Date {
		return setMilliseconds(setSeconds(setHours(setMinutes(NOW, 0), 0), 0), 0);
	}

	lineChartCustomColors = [
		{name: "Bestellungen", value: "#43a047"}
	];

	_data: OverTimeData[] = [];
	lineChartData: LineChartData;

	loading = true;

	@Input() set data(data: OverTimeData[]) {
		if (data === null) {
			this.loading = true;
			return;
		}
		this.loading = false;

		this._data = this.fillMissingTimestamps(data, this.startDate, this.endDate);
		this.lineChartData = this.toLineChartData(this._data);
	}

	constructor(private cdRef: ChangeDetectorRef) {
	}

	ngOnInit() {
	}

	fillMissingTimestamps(data: OverTimeData[], from: Date, to: Date): OverTimeData[] {
		//interval is always 1 day
		const newData: OverTimeData[] = [];
		const serverData: { [timestamp: string]: number } = data.reduce((acc, entry) => {
			acc[entry.timestamp] = entry.amount;
			return acc;
		}, {});

		let currentStep = from;
		while (isBefore(currentStep, to)) {
			//2018-12-21T01:00:00.000Z => replace every number after T with a 0
			//thanks, timezones..
			const isoRegex = /(.*)T(.*)Z/;
			const regexResults = isoRegex.exec(currentStep.toISOString());
			const currentStepISO = regexResults[1] + "T" + "00:00:00" + "Z";

			let dataEntry: OverTimeData = {
				timestamp: currentStepISO,
				amount: serverData[currentStepISO] || 0
			};

			newData.push(dataEntry);
			currentStep = addDays(currentStep, 1);
		}

		return newData;
	}

	toLineChartData(data: OverTimeData[]): { name: string, series: { name: string, value: number }[] }[] {
		return [{
			name: "Bestellungen",
			series: data
			//todo make name more readable maybe
				.map(it => ({
					name: format(new Date(it.timestamp), "DD. MMM", {locale: deLocale}),
					value: it.amount
				}))
		}]
	}
}

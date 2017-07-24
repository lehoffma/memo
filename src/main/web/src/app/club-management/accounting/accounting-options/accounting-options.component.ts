import {Component, OnInit} from "@angular/core";
import * as moment from "moment";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {QueryParameterService} from "../../../shared/services/query-parameter.service";

@Component({
	selector: "memo-accounting-options",
	templateUrl: "./accounting-options.component.html",
	styleUrls: ["./accounting-options.component.scss"]
})
export class AccountingOptionsComponent implements OnInit {
	eventTypes = {
		tours: true,
		events: true,
		merch: true
	};

	costTypes = {
		tickets: true,
		tours: true,
		fuel: true,
		leasingCar: true,
		food: true
	};

	dateOptions = {
		from: moment().startOf("month").toDate(),
		to: moment().endOf("month").toDate()
	};

	constructor(private queryParameterService: QueryParameterService,
				private router: Router,
				private activatedRoute: ActivatedRoute) {
	}

	ngOnInit() {
		//todo read query params and init options accordingly
		this.updateQueryParams();
	}

	/**
	 *
	 * @param object
	 * @returns {string}
	 */
	getBinaryQueryParamValue(object: {
		[key: string]: boolean
	}): string {
		return Object.keys(object)
			.filter(key => object[key])
			.join("|");
	}

	/**
	 * Updates the query parameters based on the values chosen by the user
	 */
	updateQueryParams() {
		let params: Params = {};

		params["eventTypes"] = "";
		if (!Object.keys(this.eventTypes).every(key => this.eventTypes[key])) {
			params["eventTypes"] = this.getBinaryQueryParamValue(this.eventTypes);
		}

		params["costTypes"] = "";
		if (!Object.keys(this.costTypes).every(key => this.costTypes[key])) {
			params["costTypes"] = this.getBinaryQueryParamValue(this.costTypes);
		}

		params["from"] = this.dateOptions.from.toISOString();
		params["to"] = this.dateOptions.to.toISOString();

		this.activatedRoute.queryParamMap.first()
			.map(queryParamMap =>
				this.queryParameterService.updateQueryParams(queryParamMap, params))
			.subscribe(newQueryParams => this.router.navigate(["management", "costs"], {queryParams: newQueryParams}));
	}
}

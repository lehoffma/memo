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
		this.readQueryParams();
		//todo read query params and init options accordingly
		this.updateQueryParams();
	}

	/**
	 *
	 * @param object
	 * @param keys
	 */
	readBinaryValuesFromQueryParams(object: {
		[key: string]: boolean
	}, keys: string[]) {
		Object.keys(object)
			.filter(key => keys.indexOf(key) === -1)
			.forEach(key => object[key] = false);
		keys.forEach(key => object[key] = true);
	}

	/**
	 * Updates the values by extracting them from the url query parameters
	 */
	readQueryParams() {
		this.activatedRoute.queryParamMap
			.subscribe(queryParamMap => {
				if (queryParamMap.has("eventTypes")) {
					this.readBinaryValuesFromQueryParams(this.eventTypes, queryParamMap.get("eventTypes").split("|"));
				}
				if (queryParamMap.has("costTypes")) {
					this.readBinaryValuesFromQueryParams(this.costTypes, queryParamMap.get("costTypes").split("|"));
				}
				if (queryParamMap.has("from") && queryParamMap.has("to")) {
					this.dateOptions.from = moment(queryParamMap.get("from")).toDate();
					this.dateOptions.to = moment(queryParamMap.get("to")).toDate();
				}
			})
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
		let assignType = (paramKey: string, object: {
			[key: string]: boolean
		}) => {
			params[paramKey] = "";
			if (!Object.keys(object).every(key => object[key])) {
				params[paramKey] = this.getBinaryQueryParamValue(object);
				if (params[paramKey] === "") {
					params[paramKey] = "none";
				}
			}
		};

		assignType("eventTypes", this.eventTypes);
		assignType("costTypes", this.costTypes);

		params["from"] = this.dateOptions.from.toISOString();
		params["to"] = this.dateOptions.to.toISOString();

		this.activatedRoute.queryParamMap.first()
			.map(queryParamMap =>
				this.queryParameterService.updateQueryParams(queryParamMap, params))
			.subscribe(newQueryParams => this.router.navigate(["management", "costs"], {queryParams: newQueryParams}));
	}
}

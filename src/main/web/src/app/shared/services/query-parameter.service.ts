import {Injectable} from "@angular/core";
import {ParamMap, Params} from "@angular/router";

@Injectable()
export class QueryParameterService {

	constructor() {

	}

	/**
	 *
	 * @param paramMap
	 * @param queryParams
	 * @returns {Params}
	 */
	static updateQueryParams(paramMap: ParamMap, queryParams: Params): Params {
		const oldParamKeys = paramMap.keys
			.filter(key => ["page", "pageSize", "sortBy", "direction"].includes(key))
			.filter(key => !Object.keys(queryParams).includes(key));

		let newQueryParams: Params = {};

		oldParamKeys.forEach(key => newQueryParams[key] = paramMap.get(key));
		Object.keys(queryParams)
		//ignore empty parameter values (i.e. remove empty values from the param map)
			.filter(key => queryParams[key] !== null && queryParams[key] !== undefined)
			.filter(key => ("" + queryParams[key]).length > 0)
			.forEach(key => newQueryParams[key] = queryParams[key]);

		console.log(paramMap, queryParams, newQueryParams);
		return newQueryParams;
	}
}

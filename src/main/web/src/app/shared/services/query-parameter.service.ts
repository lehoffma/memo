import {Injectable} from "@angular/core";
import {Params} from "@angular/router";

@Injectable()
export class QueryParameterService {

	constructor() {

	}

	/**
	 *
	 * @param params
	 * @param queryParams
	 * @returns {Params}
	 */
	static updateQueryParams(params: Params, queryParams: Params): Params {
		const addedKeys = Object.keys(queryParams)
			.filter(key => queryParams[key] !== null && queryParams[key] !== undefined)
			.filter(key => !Object.keys(params).includes(key));

		const overwrittenParamKeys = Object.keys(params)
			.filter(key => Object.keys(queryParams).includes(key))
			.filter(key => queryParams[key] !== null && queryParams[key] !== undefined);

		const removedKeys = Object.keys(params)
			.filter(key => Object.keys(queryParams).includes(key))
			.filter(key => queryParams[key] === null || queryParams[key] === undefined);

		let newQueryParams: Params = {...params};

		addedKeys.forEach(key => newQueryParams[key] = queryParams[key]);
		removedKeys.forEach(removedKey => delete newQueryParams[removedKey]);
		overwrittenParamKeys.forEach(overwrittenKey => newQueryParams[overwrittenKey] = queryParams[overwrittenKey]);

		return newQueryParams;
	}
}

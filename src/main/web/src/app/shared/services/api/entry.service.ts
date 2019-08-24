import {Injectable} from "@angular/core";
import {createEntry, Entry} from "../../model/entry";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "app/shared/services/api/servlet.service";
import {EntryCategoryService} from "./entry-category.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {combineLatest, Observable} from "rxjs";
import {map, mergeMap, tap} from "rxjs/operators";
import {EventService} from "./event.service";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {Filter} from "../../model/api/filter";
import {Page} from "../../model/api/page";
import {ParamMap} from "@angular/router";
import {getIsoDateFromDateObject, setProperties} from "../../model/util/base-object";
import {AccountingState, DatePreview, DatePreviewApiResponse} from "../../model/accounting-state";
import {getMonth, getYear, parse, setMonth, setYear} from "date-fns";

interface EntryApiResponse {
	entries: Entry[];
}

@Injectable()
export class EntryService extends ServletService<Entry> {
	redirectUrl: string;

	constructor(protected http: HttpClient,
				private eventService: EventService,
				private entryCategoryService: EntryCategoryService) {
		super(http, "/api/entry");
	}


	jsonToObservable(json: any): Observable<Entry> {
		return combineLatest([
			this.entryCategoryService.getById(json["category"]),
			this.eventService.getById(json["item"])
		])
			.pipe(
				map(([category, item]) => setProperties(setProperties(createEntry(), json), {category, item}))
			)
	}


	getState(reload: boolean = false): Observable<AccountingState> {
		const params = new HttpParams();
		const request = this.performRequest(this.http.get<AccountingState>(this.baseUrl + "/state")).pipe(
			map(it => ({...it, timestamp: new Date()})),
			map(it => this.transformDates(it)),
		);
		if (reload) {
			this._cache.invalidate("other", "/state?");
		}

		return this._cache.other<AccountingState>(params, request, "/state");
	}


	private transformDates(state: AccountingState): AccountingState {
		state.monthlyChanges = state.monthlyChanges.map(it => ({
			totalBalance: it.totalBalance,
			month: new Date(getIsoDateFromDateObject(it.month as any))
		}));
		return state;
	}

	/**
	 *
	 * @param eventId
	 * @param pageRequest
	 * @param sort
	 */
	getEntriesOfEvent(eventId: number,
					  pageRequest: PageRequest,
					  sort: Sort): Observable<Page<Entry>> {
		return this.get(
			Filter.by({"eventId": "" + eventId}),
			pageRequest,
			sort
		);
	}

	//todo get by filter options

	paramMapToFilter(queryParamMap: ParamMap): Filter {
		const allowedParameters = ["minDate", "maxDate", "eventId", "entryType"];
		return this.toFilter(queryParamMap, allowedParameters);
	}

	/**
	 *
	 * @param id
	 * @param options
	 */
	remove(id: number, options?: any): Observable<Object> {
		return this.performRequest(this.http.delete(this.baseUrl, {
			params: new HttpParams().set("id", "" + id),
			responseType: "text"
		}))
			.pipe(
				tap(() => this._cache.invalidateById(id))
			);
	}

	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param entry
	 * @param options
	 * @returns {Observable<T>}
	 */
	addOrModify(requestMethod: AddOrModifyRequest,
				entry: Entry, options?: any): Observable<Entry> {
		let body = {};

		if (options) {
			Object.keys(options)
				.forEach(key => body[key] = options[key]);
		}

		if (entry["addresses"]) {
			delete entry["addresses"];
		}
		let {item, category, ...fixedEntry} = entry;
		fixedEntry["item"] = item.id === undefined ? item : item.id;
		fixedEntry["category"] = category.id === undefined ? category : category.id;

		return this.performRequest(requestMethod<AddOrModifyResponse>("/api/entry", {entry: fixedEntry, ...body}, {
			headers: new HttpHeaders().set("Content-Type", "application/json"),
		}))
			.pipe(
				tap(() => this._cache.invalidateById(entry.id)),
				mergeMap(response => this.getById(response.id))
			);
	}

	private fillMissingData(datePreviews: DatePreview[], timespan: "month" | "year", year: number): DatePreview[] {
		if (timespan === "year") {
			const startYear = 2014;
			const endYear = getYear(new Date());
			const filledData: DatePreview[] = [];
			let previewIndex = 0;
			for (let currentYear = startYear; currentYear <= endYear; currentYear++) {
				let datePreview: DatePreview = {date: setYear(new Date(), currentYear), totalBalance: 0};
				if (datePreviews.length > previewIndex) {
					const y = getYear(datePreviews[previewIndex].date);
					if (y === currentYear) {
						datePreview = datePreviews[previewIndex];
						previewIndex++;
					}
				}
				filledData.push(datePreview);
			}
			return filledData;
		}

		const filledData: DatePreview[] = [];
		let previewIndex = 0;
		for (let month = 0; month < 12; month++) {
			let datePreview: DatePreview = {date: setMonth(setYear(new Date(), year), month), totalBalance: 0};
			if (datePreviews.length > previewIndex) {
				const m = getMonth(datePreviews[previewIndex].date);
				if (m === month) {
					datePreview = datePreviews[previewIndex];
					previewIndex++;
				}
			}
			filledData.push(datePreview);
		}
		return filledData;
	}

	getTimespanSummaries(timespan: "month" | "year", year: number, reload = false): Observable<DatePreview[]> {
		const params = new HttpParams().set("timespan", timespan).set("year", year + "");
		const request = this.performRequest(this.http.get<DatePreviewApiResponse[]>(this.baseUrl + "/timespanSummary", {params}))
			.pipe(
				map(summaries => summaries.map(it => ({...it, date: parse(it.date)}))),
				map(summaries => this.fillMissingData(summaries, timespan, year)),
				tap(it=> console.log(it)),
			);

		if (reload) {
			this._cache.invalidateParams("other", params, "/timespanSummary");
		}

		return this._cache.other<DatePreview[]>(params, request, "/timespanSummary");
	}
}

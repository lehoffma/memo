import {Injectable} from "@angular/core";
import {createEntry, Entry} from "../../model/entry";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "app/shared/services/api/servlet.service";
import {EntryCategoryService} from "./entry-category.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {combineLatest, Observable, of} from "rxjs";
import {delay, map, mergeMap, tap} from "rxjs/operators";
import {EventService} from "./event.service";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {Filter} from "../../model/api/filter";
import {Page} from "../../model/api/page";
import {ParamMap} from "@angular/router";
import {setProperties} from "../../model/util/base-object";
import {AccountingState, DatePreview} from "../../model/accounting-state";
import {setMonth, setYear} from "date-fns";

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
		return combineLatest(
			this.entryCategoryService.getById(json["category"]),
			this.eventService.getById(json["item"])
		)
			.pipe(
				map(([category, item]) => setProperties(setProperties(createEntry(), json), {category, item}))
			)
	}


	getState(): Observable<AccountingState> {
		return this.performRequest(this.http.get<AccountingState>(this.baseUrl + "/state")).pipe(
			map(it => ({...it, timestamp: new Date()}))
		)
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

	getTimespanSummaries(timespan: "month" | "year", year: number): Observable<DatePreview[]> {

		if (timespan === "year") {
			return of([
				{
					totalBalance: 2500.20,
					date: setYear(new Date(), 2014)
				},
				{
					totalBalance: -2000.20,
					date: setYear(new Date(), 2015)
				},
				{
					totalBalance: 355.55,
					date: setYear(new Date(), 2016)
				},
				{
					totalBalance: -2200.00,
					date: setYear(new Date(), 2017)
				},
				{
					totalBalance: 1999.99,
					date: setYear(new Date(), 2018)
				},
				{
					totalBalance: -50.22,
					date: setYear(new Date(), 2019)
				}
			])
		}

		//todo remove demo
		return of([
			{
				totalBalance: 100.203,
				date: setYear(setMonth(new Date(), 0), year)
			},
			{
				totalBalance: 100.203,
				date: setYear(setMonth(new Date(), 1), year)
			},
			{
				totalBalance: 205.22,
				date: setYear(setMonth(new Date(), 2), year)
			},
			{
				totalBalance: -500.44,
				date: setYear(setMonth(new Date(), 3), year)
			},
			{
				totalBalance: 0,
				date: setYear(setMonth(new Date(), 4), year)
			},
			{
				totalBalance: 0,
				date: setYear(setMonth(new Date(), 5), year)
			},
			{
				totalBalance: 0,
				date: setYear(setMonth(new Date(), 6), year)
			},
			{
				totalBalance: 0,
				date: setYear(setMonth(new Date(), 7), year)
			},
			{
				totalBalance: 0,
				date: setYear(setMonth(new Date(), 8), year)
			},
			{
				totalBalance: 0,
				date: setYear(setMonth(new Date(), 9), year)
			},
			{
				totalBalance: 0,
				date: setYear(setMonth(new Date(), 10), year)
			},
			{
				totalBalance: 0,
				date: setYear(setMonth(new Date(), 11), year)
			}
		]).pipe(delay(500))
	}
}

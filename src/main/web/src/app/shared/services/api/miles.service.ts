import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {ApiCache} from "../../cache/api-cache";
import {map} from "rxjs/operators";
import {endOfDay, setDate, setMonth, setYear, startOfDay} from "date-fns";

export interface MilesListEntry {
	userId: number;
	miles: number;
}


@Injectable()
export class MilesService {
	protected _cache: ApiCache<MilesListEntry[]> = new ApiCache<MilesListEntry[]>();
	private baseUrl = "/api/miles";

	private readonly startOfSeason = startOfDay(setDate(setMonth(new Date(), 6), 1));
	private readonly endOfSeason = endOfDay(setDate(setMonth(new Date(), 5), 30));

	constructor(private http: HttpClient) {

	}

	get(userId: number): Observable<MilesListEntry> {
		const params = new HttpParams().set("userId", "" + userId);
		const request = this.http.get<{ miles: MilesListEntry[] }>(this.baseUrl, {params})
			.pipe(map(it => it.miles[0]));

		return this._cache.other(params, request);
	}

	/**
	 *
	 * @param {number} userId
	 * @param {string} season
	 * @returns {Observable<number>}
	 */
	getSeasonMiles(userId: number, season: string): Observable<MilesListEntry> {
		let dates: { from: Date, to: Date };
		try {
			dates = this.getDatesFromSeasonString(season);
		}
		catch (e) {
			return throwError(e);
		}

		const params = new HttpParams().set("userId", "" + userId)
			.set("from", dates.from.toISOString())
			.set("to", dates.to.toISOString());
		const request = this.http.get<{ miles: MilesListEntry }>(this.baseUrl, {params})
			.pipe(map(it => it.miles[0]));

		return this._cache.other(params, request);
	}

	/**
	 *
	 * @returns {Observable<MilesListEntry[]>}
	 */
	getAll(): Observable<MilesListEntry[]> {
		const params = new HttpParams();
		const request = this.http.get<{ miles: MilesListEntry[] }>(this.baseUrl, {params})
			.pipe(map(it => it.miles));

		return this._cache.other(params, request);
	}

	/**
	 *
	 * @param {string} season
	 * @returns {Observable<MilesListEntry[]>}
	 */
	getAllForSeason(season: string): Observable<MilesListEntry[]> {
		let dates: { from: Date, to: Date };
		try {
			dates = this.getDatesFromSeasonString(season);
		}
		catch (e) {
			return throwError(e);
		}

		const params = new HttpParams()
			.set("from", dates.from.toISOString())
			.set("to", dates.to.toISOString());
		const request = this.http.get<{ miles: MilesListEntry[] }>(this.baseUrl, {params})
			.pipe(map(it => it.miles));

		return this._cache.other(params, request);
	}


	/**
	 * Extracts the start and end dates of the season form the given season string (e.g. 2017/18)
	 * @param {string} season
	 * @returns {{from: Date; to: Date}}
	 */
	private getDatesFromSeasonString(season: string): { from: Date, to: Date } {
		const seasonRegex = /([\d]{4})\/([\d]{2})/;
		if (!seasonRegex.test(season)) {
			console.error("Invalid season input: " + season);
			throw(new Error("Invalid season input: " + season));
		}

		const regexResults = seasonRegex.exec(season);
		const from = +regexResults[1];
		const to = +("20" + regexResults[2]);

		return {
			from: setYear(this.startOfSeason, from),
			to: setYear(this.endOfSeason, to)
		}
	}
}


import {Injectable} from "@angular/core";
import {MerchStock, MerchStockList} from "../../../shop/shared/model/merch-stock";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {MerchColor} from "../../../shop/shared/model/merch-color";
import {Merchandise} from "../../../shop/shared/model/merchandise";
import {Observable, of} from "rxjs";
import {mergeMap, share, tap} from "rxjs/operators";
import {processSequentiallyAndWait} from "../../../util/observable-util";
import {Sort} from "../../model/api/sort";
import {Filter} from "../../model/api/filter";

export interface StockMap {
	[size: string]: {
		[color: string]: number;
	}
}

@Injectable()
export class StockService extends ServletService<MerchStock> {
	readonly possibleSizes = [
		"XXS",
		"XS",
		"S",
		"M",
		"L",
		"XL",
		"XXL",
		"XXXL",
		"4XL",
		"5XL"
	];

	constructor(protected http: HttpClient) {
		super(http, "/api/stock");
	}

	/**
	 *
	 * @param eventId
	 * @param pageRequest
	 * @param sort
	 * @returns {Observable<MerchStockList>}
	 */
	getByEventId(eventId: number, sort: Sort = Sort.none()): Observable<MerchStock[]> {
		return this.getAll(
			Filter.by({"eventId": "" + eventId}),
			sort
		)
	}


	/**
	 *
	 * @param {MerchStockList} stockList
	 * @returns {StockMap}
	 */
	toStockMap(stockList: MerchStockList): StockMap {
		const options = this.getStockOptions([stockList]);

		//initialize the 2d map with zeroes
		const stockMap: StockMap = options.size.reduce((map, size) => {
			map[size] = options.color.reduce((object, color) => {
				object[color.name] = 0;
				return object;
			}, {});
			return map;
		}, {});


		return stockList
			.reduce((map, stockItem: MerchStock) => {
				map[stockItem.size][stockItem.color.name] += stockItem.amount;
				return map;
			}, stockMap)
	}

	/**
	 *
	 * @param stockList
	 * @returns {{size: string[], color: string[]}}
	 */
	getStockOptions(stockList: MerchStockList[]) {
		return {
			size: stockList.reduce((sizes: string[], current) => {
				current.forEach(stock => {
					if (!sizes.includes(stock.size)) {
						sizes.push(stock.size);
					}
				});
				return sizes;
			}, [])
				.sort((a, b) => {
					const valueA = this.possibleSizes.indexOf(a);
					const valueB = this.possibleSizes.indexOf(b);
					return valueA - valueB;
				})
			,
			color: stockList.reduce((colors: MerchColor[], current) => {
				current.forEach(stock => {
					if (!colors.find(color => color.name === stock.color.name)) {
						colors.push(stock.color);
					}
				});
				return colors;
			}, [])
		};
	}

	/**
	 *
	 * @param requestMethod
	 * @param stock
	 * @param eventId
	 */
	addOrModify(requestMethod: AddOrModifyRequest,
				stock: MerchStock, eventId: number): Observable<MerchStock> {
		const modifiedStock = {
			...stock,
			item: stock.item.id
		};

		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {stock: modifiedStock}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		}))
			.pipe(
				tap(() => this._cache.invalidateByPartialParams(new HttpParams().set("eventId", "" + eventId))),
				mergeMap(response => this.getById(response.id, eventId))
			);
	}

	/**
	 *
	 * @param stock
	 * @param eventId
	 */
	add(stock: MerchStock, eventId: number): Observable<MerchStock> {
		stock.id = -1;	//todo is this really needed?
		return this.addOrModify(this.http.post.bind(this.http), stock, eventId);
	}

	/**
	 *
	 * @param stock
	 * @param eventId
	 */
	modify(stock: MerchStock, eventId: number): Observable<MerchStock> {
		return this.addOrModify(this.http.put.bind(this.http), stock, eventId);
	}

	/**
	 *
	 * @param id
	 * @param options
	 */
	remove(id: number): Observable<Object> {
		return this.performRequest(this.http.delete(this.baseUrl, {
			params: new HttpParams().set("id", "" + id)
		}))
			.pipe(
				tap(() => this._cache.invalidateById(id))
			);
	}

	/**
	 *
	 * @param {Merchandise} merch
	 * @param {MerchStockList} previous
	 * @param {MerchStockList} current
	 * @returns {Observable<any>}
	 */
	pushChanges(merch: Merchandise, previous: MerchStockList, current: MerchStockList): Observable<any> {
		//delete objects that are part of the previous stock, but are not contained in the final object
		const removeRequests = [...previous
			.filter(stockItem => !current.find(it => it.id === stockItem.id))
			.map(previousItem => this.remove(previousItem.id))];

		//edit objects that are part of both objects, but contain different data
		const editRequests = [...previous
			.map(stockItem => current.find(it => it.id === stockItem.id && (
				it.size !== stockItem.size || it.amount !== stockItem.amount || it.color.name !== stockItem.color.name ||
				it.color.hex !== stockItem.color.hex || it.item.id !== stockItem.item.id
			)))
			.filter(editedItem => editedItem !== undefined)
			.map(editedItem => this.modify(editedItem, editedItem.item.id))
		];

		//add objects that are not part of the previous list, but are contained in the new one
		const addRequests = [...current
			.filter(stockItem => !previous.find(it => it.id === stockItem.id))
			.map(addedItem => {
				addedItem.item = merch;
				return addedItem;
			})
			.map(addedItem => this.add(addedItem, addedItem.item.id))
		];

		const requests = [...removeRequests, ...editRequests, ...addRequests];

		if (requests.length === 0) {
			return of([]);
		}

		return processSequentiallyAndWait(requests)
			.pipe(
				share()
			);
	}
}

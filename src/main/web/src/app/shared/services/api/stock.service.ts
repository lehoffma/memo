import {Injectable} from "@angular/core";
import {MerchStock, MerchStockList} from "../../../shop/shared/model/merch-stock";
import {Observable} from "rxjs/Observable";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {MerchColor} from "../../../shop/shared/model/merch-color";
import {Merchandise} from "../../../shop/shared/model/merchandise";

const stockMockData = [
	{
		"size": "XS",
		"color": {
			"name": "Weiss",
			"hex": "#ffffff"
		},
		"amount": 2
	},
	{
		"size": "S",
		"color": {
			"name": "Weiss",
			"hex": "#ffffff"
		},
		"amount": 1
	},
	{
		"size": "M",
		"color": {
			"name": "Weiss",
			"hex": "#ffffff"
		},
		"amount": 5
	},
	{
		"size": "L",
		"color": {
			"name": "Weiss",
			"hex": "#ffffff"
		},
		"amount": 2
	},
	{
		"size": "XL",
		"color": {
			"name": "Weiss",
			"hex": "#ffffff"
		},
		"amount": 4
	},
	{
		"size": "XS",
		"color": {
			"name": "Grün",
			"hex": "#00ff00"
		},
		"amount": 2
	},
	{
		"size": "S",
		"color": {
			"name": "Grün",
			"hex": "#00ff00"
		},
		"amount": 1
	},
	{
		"size": "M",
		"color": {
			"name": "Grün",
			"hex": "#00ff00"
		},
		"amount": 5
	},
	{
		"size": "L",
		"color": {
			"name": "Grün",
			"hex": "#00ff00"
		},
		"amount": 2
	},
	{
		"size": "XL",
		"color": {
			"name": "Grün",
			"hex": "#00ff00"
		},
		"amount": 4
	},
	{
		"size": "XS",
		"color": {
			"name": "Blau",
			"hex": "#0000ff"
		},
		"amount": 2
	},
	{
		"size": "S",
		"color": {
			"name": "Blau",
			"hex": "#0000ff"
		},
		"amount": 1
	},
	{
		"size": "M",
		"color": {
			"name": "Blau",
			"hex": "#0000ff"
		},
		"amount": 5
	},
	{
		"size": "L",
		"color": {
			"name": "Blau",
			"hex": "#0000ff"
		},
		"amount": 2
	},
	{
		"size": "XL",
		"color": {
			"name": "Blau",
			"hex": "#0000ff"
		},
		"amount": 4
	}
];

interface StockApiResponse {
	stock: MerchStock[];
}

export interface StockMap {
	[size: string]: {
		[color: string]: number;
	}
}

@Injectable()
export class StockService extends ServletService<MerchStock[]> {
	baseUrl = "/api/stock";

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
		super();
	}

	/**
	 *
	 * @param id
	 * @param eventId
	 */
	getById(id: number, eventId: number): Observable<MerchStock[]> {
		return this.performRequest(this.http.get<StockApiResponse>(this.baseUrl, {
			params: new HttpParams().set("id", "" + id)
				.set("eventId", "" + eventId)
		}))
		//todo update when merchstock is a class?
			.map(response => response.stock)
			.share();
	}

	/**
	 *
	 * @param eventId
	 * @returns {Observable<MerchStockList>}
	 */
	getByEventId(eventId: number): Observable<MerchStock[]> {
		return this.getById(null, eventId);
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
	 * @param searchTerm
	 */
	search(searchTerm: string): Observable<MerchStockList[]> {
		//todo könnte buggy sein, wird aber grad eh nich benutzt
		return this.performRequest(this.http.get<StockApiResponse>(this.baseUrl, {
			params: new HttpParams().set("searchTerm", searchTerm)
		}))
		//todo update when merchstock is a class
			.map(response => [response.stock])
			.share();
	}

	/**
	 *
	 * @param requestMethod
	 * @param stock
	 * @param eventId
	 */
	addOrModify(requestMethod: AddOrModifyRequest,
				stock: MerchStock | MerchStockList, eventId: number): Observable<MerchStockList> {
		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {stock}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		}))
			.flatMap(response => this.getById(response.id, eventId));
	}

	/**
	 *
	 * @param stock
	 * @param eventId
	 */
	add(stock: MerchStock | MerchStockList, eventId: number): Observable<MerchStockList> {
		return this.addOrModify(this.http.post.bind(this.http), stock, eventId);
	}

	/**
	 *
	 * @param stock
	 * @param eventId
	 */
	modify(stock: MerchStock | MerchStockList, eventId: number): Observable<MerchStockList> {
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
		}));
	}

	/**
	 *
	 * @param {Merchandise} merch
	 * @param {MerchStockList} previous
	 * @param {MerchStockList} current
	 * @returns {Observable<any>}
	 */
	pushChanges(merch: Merchandise, previous: MerchStockList, current: MerchStockList):Observable<any>{
		//delete objects that are part of the previous stock, but are not contained in the final object
		const removeRequests = [...previous
			.filter(stockItem => !current.find(it => it.id === stockItem.id))
			.map(previousItem => this.remove(previousItem.id)
				.share())];

		//edit objects that are part of both objects, but contain different data
		const editRequests = [...previous
			.filter(stockItem => !!current.find(it => it.id === stockItem.id && (
				it.size !== stockItem.size || it.amount !== stockItem.amount || it.color.name !== stockItem.color.name ||
				it.color.hex !== stockItem.color.hex || it.event.id !== stockItem.event.id
			)))
			.map(editedItem => this.modify(editedItem, editedItem.event.id)
				.share())
		];

		//add objects that are not part of the previous list, but are contained in the new one
		const addRequests = [...current
			.filter(stockItem => !previous.find(it => it.id === stockItem.id))
			.map(addedItem => {
				addedItem.event = merch;
				return addedItem;
			})
			.map(addedItem => this.add(addedItem, addedItem.event.id)
				.share())
		];


		return Observable.combineLatest(
			...removeRequests,
			...editRequests,
			...addRequests
		);
	}
}

import {Injectable} from "@angular/core";
import {MerchStockList} from "../../shop/shared/model/merch-stock";
import {Observable} from "rxjs/Observable";
import {Headers, Http, RequestOptions, RequestOptionsArgs, Response} from "@angular/http";
import {ServletService} from "./servlet.service";
import {Merchandise} from "../../shop/shared/model/merchandise";

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

@Injectable()
export class StockService extends ServletService<MerchStockList> {

	constructor(protected http: Http) {
		super();
	}

	/**
	 *
	 * @param id
	 * @param eventId
	 */
	getById(id: number, eventId: number): Observable<MerchStockList> {
		let params = new URLSearchParams();
		params.set("id", "" + id);
		params.set("eventId", "" + eventId);


		return this.performRequest(this.http.get("/api/stock", {search: params}))
		//todo update when merchstock is a class
			.map(response => response.json().stock as MerchStockList);
	}

	/**
	 *
	 * @param eventId
	 * @returns {Observable<MerchStockList>}
	 */
	getByEventId(eventId: number): Observable<MerchStockList> {
		return this.getById(null, eventId);
	}

	/**
	 *
	 * @param merchList
	 */
	mapToStockTableObject(merchList: Merchandise[]):Observable<any>{
		return Observable.combineLatest(merchList.map(merch => this.getByEventId(merch.id)))
			.map((stockList:MerchStockList[]) => {
				let options = this.getStockOptions(stockList);

				/**
				 *
				 * @param stock
				 * @param options
				 * @param stockKey
				 * @param optionsKey
				 * @param stockValue
				 * @returns {Array}
				 */
				let getStockAmountList = function (stock: MerchStockList, options: { [key: string]: string[] }, stockKey: string, optionsKey: string, stockValue: string) {
					let list = stock
						.filter(stock => stock[stockKey] === stockValue || stock[stockKey].name === stockValue)
						.reduce((acc, stock) => {
							let index = options[optionsKey].findIndex(option =>
								option === stock[optionsKey] || option === stock[optionsKey].name
							);
							acc[index] = stock.amount;
							return acc;
						}, []);

					list.push(list.reduce((acc, val) => acc + val, 0));

					return list;
				};


				return merchList.map((merchObject, index) => {
					let transformedMerch: any = {id: merchObject.id};
					options.size.forEach(size => {
						transformedMerch[size] = getStockAmountList(stockList[index], options, "size", "color", size);
					});
					options.color.forEach(color => {
						transformedMerch[color] = getStockAmountList(stockList[index], options, "color", "size", color);
					});
					transformedMerch["title"] = merchObject.title;
					transformedMerch["total"] = options.size.reduce(
						(acc, size) => acc + transformedMerch[size][transformedMerch[size].length - 1]
						, 0
					);

					return transformedMerch;
				})
			});

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
			}, []),
			color: stockList.reduce((colors: string[], current) => {
				current.forEach(stock => {
					if (!colors.find(color => color === stock.color.name)) {
						colors.push(stock.color.name);
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
		let url = `/api/stock?searchTerm=${searchTerm}`;

		//todo mock data

		return this.performRequest(this.http.get(url))
		//todo update when merchstock is a class
			.map(response => response.json().stock as MerchStockList[]);
	}

	/**
	 *
	 * @param requestMethod
	 * @param stock
	 * @param eventId
	 */
	addOrModify(requestMethod: (url: string, body: any, options?: RequestOptionsArgs) => Observable<Response>,
				stock: MerchStockList, eventId: number): Observable<MerchStockList> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return this.performRequest(requestMethod("/api/stock", {stock}, requestOptions))
			.map(response => response.json().id as number)
			.flatMap(id => this.getById(id, eventId));
	}

	/**
	 *
	 * @param stock
	 * @param eventId
	 */
	add(stock: MerchStockList, eventId: number): Observable<MerchStockList> {
		return this.addOrModify(this.http.post.bind(this.http), stock, eventId);
	}

	/**
	 *
	 * @param stock
	 * @param eventId
	 */
	modify(stock: MerchStockList, eventId: number): Observable<MerchStockList> {
		return this.addOrModify(this.http.put.bind(this.http), stock, eventId);
	}

	/**
	 *
	 * @param id
	 * @param options
	 */
	remove(id: number): Observable<Response> {
		let params = new URLSearchParams();
		params.set("id", "" + id);
		return this.performRequest(this.http.delete("/api/stock", {search: params}));
	}

}

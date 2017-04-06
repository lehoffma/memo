import {AbstractStore} from "./store";
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Tour} from "../../shop/shared/model/tour";

@Injectable()
export class TourStore extends AbstractStore<Tour> {
	protected jsonToObject(json: any): Tour {
		return new Tour(
			json["id"],
			json["title"],
			new Date(json["date"]),
			json["description"],
			json["expectedRole"],
			json["imagePath"],
			json["capacity"],
			json["priceMember"],
			json["meetingPoint"],
			json["vehicle"],
			json["miles"],
			json["destination"],
			json["emptySeats"],
			json["participants"]
		)
	}

	constructor(private _http: Http) {
		super(_http);
		// this.baseUrl = "www.meilenwoelfe.de/shop";
		this.baseUrl = "/resources/mock-data";
		this.apiURL = "tours";
		this.loadDataUrl = `${this.baseUrl}/${this.apiURL}.json`;
		this.load();
	}
}

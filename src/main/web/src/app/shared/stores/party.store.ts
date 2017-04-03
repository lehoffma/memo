import {Injectable} from "@angular/core";
import {Party} from "../model/party";
import {AbstractStore} from "./store";
import {Http} from "@angular/http";

@Injectable()
export class PartyStore extends AbstractStore<Party> {
    protected jsonToObject(json: any): Party {
        return new Party(
            json["id"],
            json["title"],
            new Date(json["date"]),
            json["description"],
            json["expectedRole"],
			json["imagePath"],
            json["capacity"],
            json["priceMember"],
            json["meetingPoint"],
            json["emptySeats"],
            json["participants"]
        )
    }

    constructor(private _http: Http) {
        super(_http);
        // this.baseUrl = "www.meilenwoelfe.de/shop";
        this.baseUrl = "/resources/mock-data";
        this.apiURL = "partys";
        this.loadDataUrl = `${this.baseUrl}/${this.apiURL}.json`;
        this.load();
    }
}

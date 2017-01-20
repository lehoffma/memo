import {AbstractStore} from "./store";
import {Injectable} from "@angular/core";
import {Merchandise} from "../model/merchandise";
import {Http} from "@angular/http";

@Injectable()
export class MerchStore extends AbstractStore<Merchandise> {
    protected jsonToObject(json: any): Merchandise {
        return new Merchandise(
            json["id"],
            json["title"],
            new Date(json["date"]),
            json["description"],
            json["expectedRole"],
            json["picPath"],
            json["capacity"],
            json["color"],
            json["material"],
            json["sizeTable"],
            json["priceMember"],
            json["meetingPoint"]
        )
    }

    constructor(private _http: Http) {
        super(_http);
        // this.baseUrl = "www.meilenwoelfe.de/shop";
        this.baseUrl = "/resources/mock-data";
        this.apiURL = "merch";
        this.loadDataUrl = `${this.baseUrl}/${this.apiURL}.json`;
        this.load();
    }
}
import {Injectable} from "@angular/core";
import {AbstractStore} from "./store";
import {Address} from "../model/address";
import {Http} from "@angular/http";
@Injectable()
export class AddressStore extends AbstractStore<Address> {
    protected jsonToObject(json: any): Address {
        return new Address(
            json["id"],
            json["street"],
            json["streetNr"],
            json["zip"],
            json["city"],
            json["country"]
        );
    }

    constructor(private _http: Http) {
        super(_http);
        // this.baseUrl = "www.meilenwoelfe.de/shop";
        this.baseUrl = "/resources/mock-data";
        this.apiURL = "addresses";
        this.loadDataUrl = `${this.baseUrl}/${this.apiURL}.json`;
        this.load();
    }
}



import {Component, OnInit, Input} from "@angular/core";
import {Observable} from "rxjs";

@Component({
    selector: 'details-table',
    templateUrl: './object-details-table.component.html',
    styleUrls: ["./object-details-table.component.scss"]
})
export class DetailsTableComponent implements OnInit {
    @Input() objectObservable: Observable<any> = Observable.of();

    filteredAttributes = [];

    constructor() {
    }

    ngOnInit() {
        this.filteredAttributes = Object.assign([], [
            '_id', '_title', '_description', '_expectedRole', '_picPath', '_priceMember', '_participants',
            '_meetingPoint', '_destination', '_colors', '_sizeTable']);
    }

}
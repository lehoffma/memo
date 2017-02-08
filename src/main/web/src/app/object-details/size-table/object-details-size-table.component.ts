import {Component, OnInit, Input} from "@angular/core";
import {Observable} from "rxjs";
import {Merchandise} from "../../shared/model/merchandise";

@Component({
    selector: 'details-size-table',
    templateUrl: './object-details-size-table.component.html',
    styleUrls: ["./object-details-size-table.component.scss"]
})
export class DetailsSizeTableComponent implements OnInit {
    @Input() clothesSizes: Observable<string[]> = Observable.of([]);
    @Input() sizeTableCategories: Observable<string[]> = Observable.of([]);
    @Input() merchObservable: Observable<Merchandise> = Observable.of(new Merchandise());

    constructor() {
    }

    ngOnInit() {
    }

}
import {Component, OnInit, Input} from "@angular/core";
import {Observable} from "rxjs";

@Component({
    selector: 'object-details-container',
    templateUrl: 'object-details-container.component.html',
    styleUrls: ["object-details-container.component.scss"]
})
export class ObjectDetailsContainerComponent implements OnInit {
    @Input() objectObservable: Observable<any> = Observable.of();

    selected: boolean = false;

    constructor() {
    }

    ngOnInit() {
    }

}
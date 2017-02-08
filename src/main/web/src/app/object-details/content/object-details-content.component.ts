import {Component, OnInit, Input} from "@angular/core";

@Component({
    selector: 'object-details-content',
    templateUrl: './object-details-content.component.html',
    styleUrls: ["./object-details-content.component.scss"]

})
export class ObjectDetailsContentComponent implements OnInit {
    @Input() title: string = "";

    constructor() {

    }

    ngOnInit() {

    }
}
import {Component, Input, OnInit} from "@angular/core";

@Component({
    selector: 'badge',
    templateUrl: './badge.component.html',
    styleUrls: ['./badge.component.scss']
})
export class BadgeComponent implements OnInit {

    @Input() value: number = 0;

    get amount(): string {
        return this.value > 99 ? "99+" : this.value + ""
    }

    constructor() {

    }

    ngOnInit() {
    }

}
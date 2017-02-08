import {Component, OnInit, Input, Output, EventEmitter} from "@angular/core";
import {Observable} from "rxjs";

export interface SelectionModel {
    value: any,
    color?: string,
    text?: string
}

@Component({
    selector: 'details-selection',
    templateUrl: './object-details-selection.component.html',
    styleUrls: ["./object-details-selection.component.scss"]
})
export class DetailsSelectionComponent implements OnInit {
    @Input() selections: Observable<SelectionModel[]> = Observable.of([]);
    @Output() selectedValueChange = new EventEmitter();

    public selectedValue = 0;
    public toggleName = "toggle" + Math.random();

    constructor() {
        console.log(this.selections);
    }

    filteredAttributes = [];

    ngOnInit() {
        this.selections.subscribe(
            selections => this.selectedValue = selections[0].value
        );
    }

    selectedValueHasChanged(selectedValue = this.selectedValue) {
        this.selectedValueChange.emit({value: selectedValue});
    }
}
import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {MultiLevelSelectParent} from "./shared/multi-level-select-parent";

@Component({
	selector: "memo-multi-level-select",
	templateUrl: "./multi-level-select.component.html",
	styleUrls: ["./multi-level-select.component.scss"]
})
export class MultiLevelSelectComponent implements OnInit {
	@Input() title: string;
	@Input() icon: string = "filter_list";
	@Input() options: MultiLevelSelectParent[];
	@Output() itemSelected: EventEmitter<MultiLevelSelectParent> = new EventEmitter();

	constructor() {
	}

	ngOnInit() {
	}


	/**
	 * Triggert das itemSelected Event mit dem gegebenen option-object
	 * @param event
	 */
	emitItemSelectedEvent(event: MultiLevelSelectParent) {
		this.itemSelected.emit(event);
	}

}

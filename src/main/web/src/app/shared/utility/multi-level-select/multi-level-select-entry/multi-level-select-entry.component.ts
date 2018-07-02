import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {isMultiLevelSelectLeaf, isMultiLevelSelectParent, MultiLevelSelectOption} from "../shared/multi-level-select-option";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MultiLevelSelectParent} from "../shared/multi-level-select-parent";
import {MultiLevelSelectLeaf} from "../shared/multi-level-select-leaf";

@Component({
	selector: "memo-multi-level-select-entry",
	templateUrl: "./multi-level-select-entry.component.html",
	styleUrls: ["./multi-level-select-entry.component.scss"],
	animations: [
		trigger("expandedState", [
			state("1", style({transform: "rotate(180deg)"})),
			state("0", style({transform: "rotate(360deg)"})),
			transition("0 => 1", animate("200ms ease-in")),
			transition("1 => 0", animate("200ms ease-out")),
		])
	]
})
export class MultiLevelSelectEntryComponent implements OnInit {
	@Input() option: MultiLevelSelectParent;
	@Input() selectType: "single" | "multiple";

	@Output() itemSelected: EventEmitter<MultiLevelSelectOption> = new EventEmitter();


	constructor() {
	}

	ngOnInit() {
	}

	/**
	 * Callback für Option, welche noch child-options hat.
	 *  => Zeige Child-Options und rufe stopPropagation auf, um default callback des mat-menus zu verhindern
	 *  (welches das menu schließen würde)
	 * @param option
	 * @param event
	 */
	parentOnClick(option: MultiLevelSelectParent, event: MouseEvent) {
		this.toggleExpand(option);
		event.stopPropagation()
	}

	/**
	 * Callback für Option, welches keine child-options hat (also ein Blattknoten im Select-Baum ist).
	 * => löse das itemSelected event aus
	 *
	 * @param option
	 * @param event
	 */
	childOnClick(option: MultiLevelSelectLeaf, event: any) {
		if (this.option.selectType === "multiple") {
			option.selected = !option.selected;
		}
		else {
			//toggle if already selected
			if (option.selected) {
				option.selected = false;
			}
			else {
				//act like a radio button, i.e. selects the clicked option but sets every other option to false
				option.selected = true;
				this.option.children
					.filter(child => child !== option)
					.forEach(child => {
						if (isMultiLevelSelectLeaf(child)) {
							child.selected = false;
						}
					});
			}
		}
		this.emitItemSelectedEvent(this.option);
	}

	/**
	 * Triggert das itemSelected Event mit dem gegebenen option-object
	 * @param option
	 */
	emitItemSelectedEvent(option: MultiLevelSelectParent) {
		this.itemSelected.emit(option);
	}

	/**
	 * Toggled den expanded wert des option objekts
	 * @param option
	 */
	toggleExpand(option: MultiLevelSelectParent) {
		option.expanded = !option.expanded;
	}


	isParent(option): option is MultiLevelSelectParent {
		return isMultiLevelSelectParent(option);
	}

	isLeaf(option): option is MultiLevelSelectLeaf {
		return isMultiLevelSelectLeaf(option);
	}
}

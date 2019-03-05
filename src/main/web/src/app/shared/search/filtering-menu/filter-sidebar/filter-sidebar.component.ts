import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {AbstractControl, FormGroup} from "@angular/forms";
import {MultiLevelSelectParent} from "../../../utility/multi-level-select/shared/multi-level-select-parent";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
	selector: "memo-filter-sidebar",
	templateUrl: "./filter-sidebar.component.html",
	styleUrls: ["./filter-sidebar.component.scss"],
	animations: [
		trigger("slideUp", [
			state("1", style({transform: "translateX(0)"})),
			transition(":enter", [
				style({transform: "translateX(-100%)"}),
				animate("200ms ease-in"),
			]),
			transition(":leave", [
				animate("200ms ease-in", style({transform: "translateX(-100%)"}))
			])
		])
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSidebarComponent implements OnInit {
	@Input() filterOptions: MultiLevelSelectParent[];
	@Input() singleSelectionForm: FormGroup;
	@Input() multiSelectionForm: FormGroup;
	@Input() showActions = false;
	@Output() onCancel = new EventEmitter();
	@Output() onSubmit = new EventEmitter();

	constructor() {
	}

	ngOnInit() {
	}


	/**
	 *
	 * @param control
	 * @param method
	 */
	selectOption(control: AbstractControl, method: any) {
		const value = control.value;
		control.setValue(Object.keys(value).reduce((acc, key) => {
			acc[key] = key === method;
			return acc
		}, {}));
	}

	withReset(option: MultiLevelSelectParent) {
		if (option.selectType === "multiple") {
			return this.multiSelectionHasFilterApplied(this.multiSelectionForm.get(option.name))
		} else {
			//there is a reset option
			if (option.children.some(child => child.name === "Alle")) {
				return this.singleSelectionForm.get(option.name).value !== "Alle";
			}
		}
	}

	multiSelectionHasFilterApplied(control: AbstractControl) {
		const value = control.value;
		return Object.keys(value).some(key => value[key]);
	}

	reset(option: MultiLevelSelectParent) {
		if (option.selectType === "multiple") {
			let control = this.multiSelectionForm.get(option.name);
			this.resetMultiSelection(control);
		} else {
			let control = this.singleSelectionForm.get(option.name);
			this.resetSingleSelection(control);
		}
	}

	resetSingleSelection(control: AbstractControl) {
		control.setValue("Alle");
	}

	resetMultiSelection(control: AbstractControl) {
		const value = control.value;
		control.setValue(Object.keys(value).reduce((acc, key) => {
			acc[key] = false;
			return acc
		}, {}));
	}


	cancel() {
		this.onCancel.emit(true);
	}

	apply() {
		this.onSubmit.emit(true);
	}

}

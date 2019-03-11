import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {AbstractControl, FormGroup} from "@angular/forms";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {FilterOption} from "../../filter-options/filter-option";
import {SingleFilterOption} from "../../filter-options/single-filter-option";
import {ShopItem} from "../../../model/shop-item";
import {EventType} from "../../../../shop/shared/model/event-type";
import {EventUtilityService} from "../../../services/event-utility.service";
import {Event} from "../../../../shop/shared/model/event";

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
	@Input() filterOptions: FilterOption[];
	@Input() formGroup: FormGroup;
	@Input() showActions = false;
	@Output() onCancel = new EventEmitter();
	@Output() onSubmit = new EventEmitter();
	@Input() isLoading = false;

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
		//multiple: {[key: string]: boolean}
		const value = control.value;
		control.setValue(Object.keys(value).reduce((acc, key) => {
			acc[key] = key === method;
			return acc
		}, {}));
	}

	withReset(option: FilterOption) {
		//todo as observable?
		let group = this.formGroup.get(option.type);
		if (!group) {
			return false;
		}
		group = group.get(option.key);
		if (!group) {
			return false;
		}

		//todo move to classes
		const value = group.value;
		switch (option.type) {
			case "single":
				const resetOption = option.values.find(child => child.label === SingleFilterOption.ALL_OPTION);
				return resetOption && value !== resetOption.key;
			case "multiple":
				return Object.keys(value).some(key => value[key]);
			case "date-range":
				return value.from || value.to;
			case "shop-item":
				return value && value.items.length > 0;
		}
	}

	reset(option: FilterOption) {
		const formControl = this.formGroup.get(option.type).get(option.key);
		switch (option.type) {
			case "single":
				formControl.setValue("Alle", {emitEvent: true});
				break;
			case "multiple":
				formControl.setValue(Object.keys(formControl.value).reduce((acc, key) => {
					acc[key] = false;
					return acc;
				}, {}), {emitEvent: true});
				break;
			case "date-range":
				formControl.reset({
					from: null,
					to: null
				}, {emitEvent: true});
				break;
			case "shop-item":
				formControl.setValue({
					items: [],
					input: "",
				}, {emitEvent: true});
		}
	}


	cancel() {
		this.onCancel.emit(true);
	}

	apply() {
		this.onSubmit.emit(true);
	}

	getEventType(event: Event): EventType{
		return EventUtilityService.getEventType(event);
	}

	onRemoveEvent(i: number, formGroup: FormGroup) {
		const currentValue = formGroup.get('items').value;
		currentValue.splice(i, 1);
		formGroup.get('items').setValue([...currentValue]);
	}

	addEvent(item: Event, formGroup: FormGroup) {
		const currentValue = formGroup.get('items').value;
		formGroup.get('items').setValue([...currentValue, item]);
	}
}

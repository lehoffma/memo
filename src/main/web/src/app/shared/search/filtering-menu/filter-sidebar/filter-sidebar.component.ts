import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {AbstractControl, FormGroup} from "@angular/forms";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {FilterOption} from "../../filter-options/filter-option";
import {EventType} from "../../../../shop/shared/model/event-type";
import {EventUtilityService} from "../../../services/event-utility.service";
import {Event} from "../../../../shop/shared/model/event";
import {BreakpointObserver} from "@angular/cdk/layout";

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

	get isMobile(){
		return this.breakpointObserver.isMatched("(max-width: 650px)");
	}

	constructor(private breakpointObserver: BreakpointObserver) {
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

		const value = group.value;
		return option.canBeReset(value);
	}

	reset(option: FilterOption) {
		const formControl = this.formGroup.get(option.type).get(option.key);
		option.reset(formControl);
	}


	cancel() {
		this.onCancel.emit(true);
	}

	apply() {
		this.onSubmit.emit(true);
	}

	getEventType(event: Event): EventType {
		return EventUtilityService.getEventType(event);
	}

	onRemoveEvent(i: number, formGroup: FormGroup) {
		const currentValue = formGroup.get("items").value;
		currentValue.splice(i, 1);
		formGroup.get("items").setValue([...currentValue]);
	}

	addEvent(item: Event, formGroup: FormGroup) {
		const currentValue = formGroup.get("items").value;
		formGroup.get("items").setValue([...currentValue, item]);
	}
}

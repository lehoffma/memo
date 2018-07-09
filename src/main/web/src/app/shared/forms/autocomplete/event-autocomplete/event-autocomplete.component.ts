import {Component, Input, OnInit} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormControl, NG_VALUE_ACCESSOR, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {Event} from "../../../../shop/shared/model/event";
import {isEventValidator} from "../../../validators/is-event.validator";
import {EventUtilityService} from "../../../services/event-utility.service";
import {debounceTime, map, mergeMap, startWith} from "rxjs/operators";
import {EventType} from "../../../../shop/shared/model/event-type";
import {EventService} from "../../../services/api/event.service";
import {PageRequest} from "../../../model/api/page-request";
import {Sort} from "../../../model/api/sort";
import {Filter} from "../../../model/api/filter";

@Component({
	selector: "memo-event-autocomplete",
	templateUrl: "./event-autocomplete.component.html",
	styleUrls: ["./event-autocomplete.component.scss"],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: EventAutocompleteComponent,
		multi: true
	}],
})
export class EventAutocompleteComponent implements OnInit, ControlValueAccessor {
	@Input() types: EventType[] = [EventType.tours, EventType.partys, EventType.merch];
	@Input() formControl: FormControl;

	filteredOptions$: Observable<Event[]>;
	_onChange;

	constructor(private formBuilder: FormBuilder,
				private eventService: EventService) {
	}

	ngOnInit() {
		this.filteredOptions$ = this.formControl.valueChanges
			.pipe(
				startWith(""),
				map(event => event && EventUtilityService.isEvent(event) ? event.title : event),
				debounceTime(300),
				mergeMap(title => this.eventService
					.get(
						Filter.by({"searchTerm": title}),
						PageRequest.first(5),
						Sort.none()
					).pipe(
						map(it => it.content)
					)
				)
			);
		this.formControl.setValidators([Validators.required, isEventValidator()]);
	}

	/**
	 * Defines how the event will be presented in the autocomplete box
	 * @returns {any}
	 * @param event
	 */
	displayFn(event: Event): string {
		if (event) {
			return event.title;
		}
		return "";
	}

	/**
	 * Filters the options array by checking the events title
	 * @param options
	 * @param name
	 * @returns {any[]}
	 */
	filter(options: Event[], name: string): Event[] {
		return options.filter(option => {
			const regex = new RegExp(`${name}`, "gi");
			return regex.test(option.title);
		});
	}

	registerOnChange(fn: any): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: any): void {
	}

	setDisabledState(isDisabled: boolean): void {
		if (isDisabled) {
			this.formControl.disable();
		}
		else {
			this.formControl.enable();
		}
	}

	writeValue(obj: any): void {
		this.formControl.setValue(obj);
	}

}

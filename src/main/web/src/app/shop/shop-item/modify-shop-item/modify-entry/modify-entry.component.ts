import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {EventService} from "../../../../shared/services/api/event.service";
import {Event} from "../../../shared/model/event";
import {EventType} from "../../../shared/model/event-type";
import {ActivatedRoute} from "@angular/router";
import {EntryCategoryService} from "../../../../shared/services/api/entry-category.service";
import {ModifyItemEvent} from "app/shop/shop-item/modify-shop-item/modify-item-event";
import {EntryCategory} from "../../../../shared/model/entry-category";
import {Observable} from "rxjs/Observable";
import {filter, map, mergeMap, startWith, take} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {isEventValidator} from "../../../../shared/validators/is-event.validator";
import {Entry} from "../../../../shared/model/entry";

@Component({
	selector: "memo-modify-entry",
	templateUrl: "./modify-entry.component.html",
	styleUrls: ["./modify-entry.component.scss"]
})
export class ModifyEntryComponent implements OnInit {
	autocompleteFormControl: FormControl = new FormControl("");
	filteredOptions: Observable<Event[]>;
	formGroup: FormGroup = this.formBuilder.group({
		"name": ["", {
			validators: [Validators.required]
		}],
		"value": [undefined, {
			validators: [Validators.required]
		}],
		"item": this.autocompleteFormControl,
		"date": [new Date(), {
			validators: [Validators.required]
		}],
		"comment": ["", {
			validators: []
		}],
		"images": this.formBuilder.group({
			"imagePaths": [[], {validators: []}],
			"imagesToUpload": [[], {validators: []}]
		}),
		"category": [undefined, {
			validators: [Validators.required]
		}]
	});

	_previousValue: Entry;
	@Input() set previousValue(previousValue: Entry) {
		this._previousValue = previousValue;

		if (!previousValue) {
			return;
		}

		this.formGroup.get("name").patchValue(previousValue.name);
		this.formGroup.get("value").patchValue(previousValue.value);
		this.formGroup.get("item").patchValue(previousValue.item);
		this.formGroup.get("date").patchValue(previousValue.date);
		this.formGroup.get("comment").patchValue(previousValue.comment);
		this.formGroup.get("category").patchValue(previousValue.category);
		this.formGroup.get("images").get("imagePaths").patchValue(previousValue.images);
	}

	get previousValue() {
		return this._previousValue;
	}

	@Input() mode: ModifyType;
	@Output() onSubmit: EventEmitter<ModifyItemEvent> = new EventEmitter();


	ModifyType = ModifyType;
	entryCategories$ = this.entryCategoryService.getCategories();


	constructor(private location: Location,
				private formBuilder: FormBuilder,
				private activatedRoute: ActivatedRoute,
				private entryCategoryService: EntryCategoryService,
				private eventService: EventService) {
		this.activatedRoute.queryParamMap
			.pipe(
				filter(queryParamMap => queryParamMap.has("eventId")),
				mergeMap(queryParamMap => this.eventService.getById(+queryParamMap.get("eventId"))),
				take(1),
			)
			.subscribe(event => {
				this.autocompleteFormControl.setValue(event);
			});

		this.filteredOptions = this.autocompleteFormControl.valueChanges
			.pipe(
				startWith(""),
				map(event => event && EventUtilityService.isEvent(event) ? event.title : event),
				mergeMap(title =>
					combineLatest(
						this.eventService.search("", EventType.tours),
						this.eventService.search("", EventType.partys),
						this.eventService.search("", EventType.merch)
					)
						.pipe(
							map(([tours, partys, merch]) => {
								let availableEvents = [...tours, ...partys, ...merch];
								return title
									? this.filter(availableEvents, title)
									: availableEvents.slice()
							})
						)
				)
			);
	}

	ngOnInit() {
		this.autocompleteFormControl.setValidators([Validators.required, isEventValidator()]);
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

	compareCategories(value1: EntryCategory, value2: EntryCategory) {
		return value1 && value2 && value1.id === value2.id;
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


	cancel() {
		this.location.back();
	}

	submitModifiedObject() {
		const entry = Entry.create().setProperties({
			id: this.previousValue ? this.previousValue.id : -1,
			name: this.formGroup.get("name").value,
			value: this.formGroup.get("value").value,
			date: this.formGroup.get("date").value,
			comment: this.formGroup.get("comment").value,
			category: this.formGroup.get("category").value,
			item: this.formGroup.get("item").value.id
		});

		this.onSubmit.emit({
			item: entry,
			images: this.formGroup.get("images").value
		});
	}
}

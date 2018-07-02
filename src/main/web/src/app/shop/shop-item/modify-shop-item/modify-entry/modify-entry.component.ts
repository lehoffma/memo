import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {EventService} from "../../../../shared/services/api/event.service";
import {Event} from "../../../shared/model/event";
import {ActivatedRoute} from "@angular/router";
import {EntryCategoryService} from "../../../../shared/services/api/entry-category.service";
import {ModifyItemEvent} from "app/shop/shop-item/modify-shop-item/modify-item-event";
import {EntryCategory} from "../../../../shared/model/entry-category";
import {Observable} from "rxjs";
import {filter, map, mergeMap, take} from "rxjs/operators";
import {createEntry, Entry} from "../../../../shared/model/entry";
import {ModifyItemService} from "../modify-item.service";
import {setProperties} from "../../../../shared/model/util/base-object";

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
	@Input() mode: ModifyType;
	@Output() onSubmit: EventEmitter<ModifyItemEvent> = new EventEmitter();
	ModifyType = ModifyType;
	entryCategories$ = this.entryCategoryService.getCategories().pipe(
		map(it => it.content)
	);

	constructor(private location: Location,
				private formBuilder: FormBuilder,
				private activatedRoute: ActivatedRoute,
				public modifyItemService: ModifyItemService,
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

	}

	_previousValue: Entry;

	get previousValue() {
		return this._previousValue;
	}

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

	ngOnInit() {
	}


	compareCategories(value1: EntryCategory, value2: EntryCategory) {
		return value1 && value2 && value1.id === value2.id;
	}


	cancel() {
		this.location.back();
	}

	submitModifiedObject() {
		const entry = setProperties(createEntry(), {
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

import {EventEmitter, Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../expandable-table/expandable-table-container.service";
import {ImageToUpload, isImageToUpload} from "./multi-image-upload.component";
import {isString, sortingFunction, SortingFunction} from "../../util/util";
import {ColumnSortingEvent} from "../expandable-table/column-sorting-event";
import {of} from "rxjs/observable/of";
import {map, take} from "rxjs/operators";
import {FormGroup} from "@angular/forms";

@Injectable()
export class MultiImageUploadService extends ExpandableTableContainerService<ImageToUpload> {

	onAdd: EventEmitter<any> = new EventEmitter();
	onDelete: EventEmitter<(ImageToUpload)[]> = new EventEmitter<(ImageToUpload)[]>();

	constructor() {
		super({
			key: null,
			descending: true
		}, of({
			"Hinzufuegen": true,
			"Bearbeiten": true,
			"Loeschen": true
		}), []);
	}


	add(): void {
		this.onAdd.emit(true);
	}

	edit(entry: ImageToUpload): void {
		//empty because the uploaded images cant be edited
	}


	remove(entries: (ImageToUpload)[]): void {
		this.onDelete.emit(entries);
	}

	satisfiesFilter(entry: (ImageToUpload), ...options): boolean {
		//there is no filtering, so no need for overriding
		return true;
	}

	comparator(sortBy: ColumnSortingEvent<(ImageToUpload)>, ...options): SortingFunction<(ImageToUpload)> {
		return sortingFunction<ImageToUpload>(image => image.name, sortBy.descending);
	}
}

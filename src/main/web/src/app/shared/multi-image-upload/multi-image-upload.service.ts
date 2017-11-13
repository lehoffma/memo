import {EventEmitter, Injectable} from '@angular/core';
import {ExpandableTableContainerService} from "../expandable-table/expandable-table-container.service";
import {ImageToUpload} from "./multi-image-upload.component";
import {attributeSortingFunction, SortingFunction} from "../../util/util";
import {ColumnSortingEvent} from "../expandable-table/column-sorting-event";
import {of} from "rxjs/observable/of";
import {map, take} from "rxjs/operators";

@Injectable()
export class MultiImageUploadService extends ExpandableTableContainerService<ImageToUpload> {

	onAdd: EventEmitter<any> = new EventEmitter();

	constructor() {
		super({
			key: "name",
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


	/**
	 *
	 * @param {number[]} indices
	 */
	deleteImages(indices: number[]) {
		const currentValue = this.dataSubject$.getValue();
		const indicesCopy = [...indices].sort();
		for (let i = indicesCopy.length - 1; i >= 0; i--) {
			currentValue.splice(indicesCopy[i], 1);
		}
		this.dataSubject$.next([...currentValue]);
	}


	remove(entries: ImageToUpload[]): void {
		this.dataSubject$
			.pipe(
				take(1),
				map(imagesToUpload => entries
					.map(image => imagesToUpload.findIndex(it => it.id === image.id)))
			)
			.subscribe(indices => this.deleteImages(indices))
	}

	satisfiesFilter(entry: ImageToUpload, ...options): boolean {
		//there is no filtering, so no need for overriding
		return true;
	}

	comparator(sortBy: ColumnSortingEvent<ImageToUpload>, ...options): SortingFunction<ImageToUpload> {
		return attributeSortingFunction(sortBy.key, sortBy.descending);
	}
}

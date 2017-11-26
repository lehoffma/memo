import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ExpandableTableColumn} from "../expandable-table/expandable-table-column";
import {RowAction} from "../expandable-table/row-action";
import {MultiImageUploadService} from "./multi-image-upload.service";
import {filter, map, take} from "rxjs/operators";

export interface ImageToUpload {
	id: string;
	name: string;
	data: any
}

@Component({
	selector: 'memo-multi-image-upload',
	templateUrl: './multi-image-upload.component.html',
	styleUrls: ['./multi-image-upload.component.scss'],
	providers: [
		MultiImageUploadService
	]
})
export class MultiImageUploadComponent implements OnInit, OnDestroy {
	//todo maximum size stuff

	private _images$ = new BehaviorSubject<ImageToUpload[]>([]);
	images$ = this.multiImageUploadService.data$
		.pipe(
			map(images => [...images.map(it => it.data)])
		);

	@Input()
	set images(images: string[]) {
		console.log(images);
		if (images) {
			const imagesToUpload = images.filter(it => it !== undefined);
			if (imagesToUpload && imagesToUpload.length > 0) {
				const currentValue = this._images$.getValue();
				this._images$.next([...currentValue, ...imagesToUpload.map(image => ({
					id: image,
					name: image,
					data: image
				}))]
					.filter((value, index, array) => array.findIndex(it => it.id === value.id) === index));

			}
		}
	}

	columnKeys: ExpandableTableColumn<ImageToUpload>[] = [
		new ExpandableTableColumn<ImageToUpload>("Name", "name")
	];
	rowActions: {
		icon?: string;
		name: string | RowAction;
		link?: (object: ImageToUpload) => string;
		route?: (object: ImageToUpload) => string;
	}[] = [
		{
			icon: "delete",
			name: RowAction.DELETE
		},
	];
	@ViewChild("fileUpload") fileUpload: ElementRef;

	@Output() onFormDataChange = new EventEmitter<any>();

	subscriptions = [];

	constructor(public multiImageUploadService: MultiImageUploadService) {
	}

	ngOnInit() {
		this.subscriptions.push(
			this.multiImageUploadService.onAdd.subscribe(
				() => this.fileUpload.nativeElement.click()
			)
		);
		this.multiImageUploadService.init(this._images$);
	}


	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	/**
	 *
	 * @param {FileList} fileList
	 */
	addImages(fileList: FileList) {
		const addedImages$ = new BehaviorSubject<ImageToUpload[]>([]);

		for (let i = 0; i < fileList.length; i++) {
			(() => {
				const reader = new FileReader();

				reader.onload = (event) => {
					const currentValue = addedImages$.getValue();
					currentValue.push({
						id: fileList.item(i).name,
						name: fileList.item(i).name,
						data: (<any>event.target).result
					});
					addedImages$.next(currentValue);
				};

				reader.readAsDataURL(fileList.item(i));
			})();
		}

		addedImages$
			.pipe(
				//only update the list if all images have been read by the file reader
				filter(images => images.length === fileList.length),
				take(1)
			)
			.subscribe(images => {
				const currentValue = this._images$.getValue();
				images.forEach(image => currentValue.push(image));
				this._images$.next([...currentValue]);
			})
	}


	/**
	 *
	 * @param event
	 */
	onFileSelect(event) {
		const fileList: FileList = event.target.files;
		const fileCount: number = fileList.length;
		const formData = new FormData();
		if (fileCount > 0) { // a file was selected
			for (let i = 0; i < fileCount; i++) {
				formData.append("file[]", fileList.item(i));
			}
			this.onFormDataChange.emit(formData);
			this.addImages(fileList);
		}
	}
}

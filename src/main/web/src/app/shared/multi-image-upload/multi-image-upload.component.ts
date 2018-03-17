import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ExpandableTableColumn} from "../expandable-table/expandable-table-column";
import {RowAction} from "../expandable-table/row-action";
import {MultiImageUploadService} from "./multi-image-upload.service";
import {filter, map, take, tap} from "rxjs/operators";
import {isString} from "../../util/util";

export interface ImageToUpload {
	id: string;
	name: string;
	data: any
}

@Component({
	selector: "memo-multi-image-upload",
	templateUrl: "./multi-image-upload.component.html",
	styleUrls: ["./multi-image-upload.component.scss"],
	providers: [
		MultiImageUploadService
	]
})
export class MultiImageUploadComponent implements OnInit, OnDestroy {
	//todo maximum size stuff

	private _images$ = new BehaviorSubject<ImageToUpload[]>([]);
	images$ = this.multiImageUploadService.data$
		.pipe(
			tap(it => console.log(it)),
			map(images => [...images.map(it => it.data)])
		);

	@Input()
	set images(images: string[] | FormData[] | ImageToUpload[]) {
		console.log(images);

		if (images && images.length > 0) {
			if (isString(images[0])) {
				const imagesToUpload = (<string[]>images).filter(it => it !== undefined);
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
			else if ((<ImageToUpload>images[0]).data !== undefined) {
				const imagesToUpload = (<ImageToUpload[]>images).filter(it => it !== undefined);
				if (imagesToUpload && imagesToUpload.length > 0) {
					const currentValue = this._images$.getValue();
					this._images$.next([...currentValue, ...imagesToUpload.map(image => ({
						id: image.id,
						name: image.name,
						data: image.data
					}))]
						.filter((value, index, array) => array.findIndex(it => it.id === value.id) === index));
				}
			}
			else {
				const imagesToUpload = (<FormData[]>images).filter(it => it !== undefined);
				if (imagesToUpload) {
					const files: File[] = [];
					imagesToUpload.forEach(formData => {
						console.log(formData);
						for (let entry of (<any>formData).values()) {
							files.push(entry);
						}
					});
					console.log(files);
				}
			}
		}
	}

	@Input() limit: number = Infinity;

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

	currentFiles: File[] = [];
	@Output() onFormDataChange = new EventEmitter<any>();
	@Output() onImageChange = new EventEmitter<ImageToUpload[]>();


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
	addImages(fileList: File[]) {
		const addedImages$ = new BehaviorSubject<ImageToUpload[]>([]);

		for (let i = 0; i < fileList.length; i++) {
			(() => {
				const reader = new FileReader();

				reader.onload = (event) => {
					const currentValue = addedImages$.getValue();
					currentValue.push({
						id: fileList[i].name,
						name: fileList[i].name,
						data: (<any>event.target).result
					});
					addedImages$.next(currentValue);
				};

				reader.readAsDataURL(fileList[i]);
			})();
		}

		addedImages$
			.pipe(
				//only update the list if all images have been read by the file reader
				filter(images => images.length === fileList.length),
				take(1)
			)
			.subscribe(images => {
				// const currentValue = this._images$.getValue();
				// images.forEach(image => currentValue.push(image));
				this._images$.next([...images]);
				this.onImageChange.emit([...images]);
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
			//examples
			// [] + [a,b,c,d,e] => [a,b,c,d,e]
			// [a,b,c,d] + [e] => [a,b,c,d,e]
			// [a,b,c] + [d,e,f] => [f,b,c,d,e] //fill up and then start from the beginning

			let files = Array.from(fileList);
			//only look at the first N files and completely replace the old ones
			if (fileCount > this.limit) {
				this.currentFiles = [...files.splice(0, this.limit)];
			}
			else {
				const after = files.splice(0, this.limit - this.currentFiles.length);
				//there are still some files left => wrap around and start from the beginning
				const before = [...files];

				//fill up until limit is reached
				this.currentFiles = [
					...before,
					...this.currentFiles.slice(before.length, before.length + this.limit - after.length),
					...after];
			}

		}

		this.currentFiles.forEach(file => formData.append("file[]", file));
		this.onFormDataChange.emit(formData);
		this.addImages(this.currentFiles);
	}

	isFinite(number: number) {
		return isFinite(number);
	}
}

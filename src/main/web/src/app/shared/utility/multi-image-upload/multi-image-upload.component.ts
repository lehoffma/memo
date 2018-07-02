import {Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {RowActionType} from "../material-table/util/row-action-type";
import {filter, map, take} from "rxjs/operators";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ImageToUpload, isImageToUpload} from "./image-to-upload";
import {ConfirmationDialogService} from "../../services/confirmation-dialog.service";
import {ModifiedImages} from "../../../shop/shop-item/modify-shop-item/modified-images";
import {InMemoryDataService} from "../material-table/in-memory-data.service";
import {TableActionEvent} from "../material-table/util/table-action-event";
import {TableColumn} from "../material-table/expandable-material-table.component";

@Component({
	selector: "memo-multi-image-upload",
	templateUrl: "./multi-image-upload.component.html",
	styleUrls: ["./multi-image-upload.component.scss"],
	providers: [
		InMemoryDataService
	]
})
export class MultiImageUploadComponent implements OnInit, OnDestroy {
	//todo maximum size stuff

	//contains: imagePaths (string[]) + imagesToUpload (ImageToUpload[])
	images$ = new BehaviorSubject<ImageToUpload[]>([]);
	imagePaths$ = this.images$.pipe(
		map(images => images.map(it => it.data))
	);
	@Input() limit: number = Infinity;
	@HostBinding("class.single-picture") singlePicture: boolean = false;
	rowActions: {
		icon?: string;
		name: string | RowActionType;
		link?: (object: ImageToUpload) => string;
		route?: (object: ImageToUpload) => string;
	}[] = [
		{
			icon: "delete",
			name: RowActionType.DELETE
		},
	];
	@ViewChild("fileUpload") fileUpload: ElementRef;
	currentFiles: File[] = [];
	imageSubscription: Subscription;
	subscriptions = [];
	columns: TableColumn<ImageToUpload>[] = [
		{columnDef: "name", header: "Name", cell: element => element.name}
	];
	displayedColumns = this.columns.map(column => column.columnDef);

	constructor(private confirmationDialogService: ConfirmationDialogService,
				public inMemoryDataService: InMemoryDataService<ImageToUpload>,
				private formBuilder: FormBuilder) {
	}

	_previousValue: string[] = [];

	get previousValue() {
		return this._previousValue;
	}

	@Input() set previousValue(previousValue: string[]) {
		this._previousValue = previousValue;
		this.formGroup.get("imagePaths").setValue(previousValue);
	}

	_formGroup: FormGroup = this.formBuilder.group({
		"imagePaths": this.formBuilder.control([]),
		"imagesToUpload": this.formBuilder.control([])
	});

	get formGroup() {
		return this._formGroup;
	}

	@Input() set formGroup(formGroup: FormGroup) {
		this._formGroup = formGroup;

		if (this.previousValue) {
			this.formGroup.get("imagePaths").setValue(this.previousValue);
		}
		this.images$.next(this.getValueFromForm(formGroup.value));
		if (this.imageSubscription) {
			this.imageSubscription.unsubscribe();
		}
		this.imageSubscription = this.formGroup.valueChanges
			.pipe(map(this.getValueFromForm))
			.subscribe(value => this.images$.next(value));
	}

	ngOnInit() {
		this.singlePicture = this.limit === 1;
		this.inMemoryDataService.init$(this.images$);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
		if (this.imageSubscription) {
			this.imageSubscription.unsubscribe();
		}
	}


	/**
	 * Callback for every table's action
	 * @param {TableActionEvent<Entry>} event
	 * @returns {any}
	 */
	handleTableAction(event: TableActionEvent<ImageToUpload>) {
		switch (event.action) {
			case RowActionType.ADD:
				return this.fileUpload.nativeElement.click();
			case RowActionType.EDIT:
				return;
			case RowActionType.DELETE:
				return this.deleteEntries(event.entries);
		}
	}

	getValueFromForm(value: ModifiedImages): ImageToUpload[] {
		return [...value.imagePaths.map(path => ({id: path, name: path, data: path})),
			...value.imagesToUpload];
	}

	/**
	 *
	 * @param {FileList} fileList
	 */
	readImages(fileList: File[]): Observable<ImageToUpload[]> {
		const value: ImageToUpload[] = Array.from(Array(length).keys())
			.map(it => ({id: null, name: null, data: null}));
		const addedImages$ = new BehaviorSubject<ImageToUpload[]>(value);

		for (let i = 0; i < fileList.length; i++) {
			(() => {
				const reader = new FileReader();

				reader.onload = (event) => {
					const currentValue = addedImages$.getValue();
					currentValue[i] = ({
						id: fileList[i].name,
						name: fileList[i].name,
						data: (<any>event.target).result
					});
					addedImages$.next(currentValue);
				};

				reader.readAsDataURL(fileList[i]);
			})();
		}

		return addedImages$
			.pipe(
				//only update the list if all images have been read by the file reader
				filter(images => images.filter(it => it.id !== null).length === fileList.length),
				take(1)
			);
	}


	/**
	 *
	 * @param event
	 */
	onFileSelect(event) {
		const fileList: FileList = event.target.files;
		let imagePaths = [...this.formGroup.value.imagePaths];
		let imagesToUpload = [...this.formGroup.value.imagesToUpload];
		let filesToUpload: File[] = [];

		if (fileList.length > 0) { // a file was selected
			//examples
			// [] + [a,b,c,d,e] => [a,b,c,d,e]
			// [a,b,c,d] + [e] => [a,b,c,d,e]
			// [a,b,c] + [d,e,f] => [f,b,c,d,e] //fill up and then start from the beginning

			let files = Array.from(fileList);
			//only look at the first N files to avoid unnecessary loading times
			filesToUpload = [...files.splice(0, this.limit)];
		}

		this.readImages(filesToUpload)
			.subscribe(images => {
				//examples (limit=5)
				// paths		toUpload	 input		  	  result
				// [a,b]		  [c,d]   	 [e]   	      [a,b],[c,d,e]
				// [a,b]		  [c,d]   	 [e,f,g]      [],[c,d,e,f,g]
				// [a,b]		  []     	 [e,f,g]      [a,b],[e,f,g]
				// [a,b]		  []     	 [c,d,e,f]    [b],[c,d,e,f]

				//how many files don't fit into the list
				const nonOverflowedImages = images.slice(0, this.limit - imagePaths.length - imagesToUpload.length);
				const overflowedImages = images.slice(this.limit - imagePaths.length - imagesToUpload.length);

				//for all non-overflowed items:
				//	add them to the end of the toUpload array
				imagesToUpload = [...imagesToUpload, ...nonOverflowedImages];

				//for every overflowed item:
				// 	if there are imagePaths left: remove one entry from imagePaths
				//	if there are none: push into toUpload list or replace one entry from toUpload list with the new images
				let replaceIndex = 0;
				for (let overflowedImage of overflowedImages) {
					if (imagePaths.length > 0) {
						imagePaths.splice(0, 1);
					}
					if (imagesToUpload.length < this.limit) {
						imagesToUpload.push(overflowedImage);
					}
					else {
						imagesToUpload.splice(replaceIndex, 1, overflowedImage);
						replaceIndex++;
					}
				}

				this.formGroup.get("imagePaths").setValue(imagePaths, {emitEvent: true});
				this.formGroup.get("imagesToUpload").setValue(imagesToUpload, {emitEvent: true});
			})
	}

	deleteWithConfirmation(entries: ImageToUpload[]) {
		const message = `Möchtest du diese${entries.length === 1 ? "s Bild" : " Bilder"} wirklich löschen?`;
		this.confirmationDialogService.open(message, () => this.deleteEntries(entries));
	}

	deleteEntries(entries: (ImageToUpload)[]) {
		const deletedUploaded = entries.filter(it => isImageToUpload(it))
			.map((entry: ImageToUpload) => this.formGroup.get("imagesToUpload").value.findIndex(it => it.id === entry.id))
			.sort();
		const deletedPrevious = entries.filter(it => !isImageToUpload(it))
			.map((entry: ImageToUpload) => this.formGroup.get("imagePaths").value.indexOf(entry.id))
			.sort();
		const uploaded: ImageToUpload[] = [...this.formGroup.get("imagesToUpload").value];
		for (let i = deletedUploaded.length - 1; i >= 0; i--) {
			uploaded.splice(deletedUploaded[i], 1);
		}

		const previous: string[] = [...this.formGroup.get("imagePaths").value];
		for (let i = deletedPrevious.length - 1; i >= 0; i--) {
			previous.splice(deletedPrevious[i], 1);
		}

		this.formGroup.get("imagesToUpload").setValue(uploaded);
		this.formGroup.get("imagePaths").setValue(previous);
	}


	isFinite(number: number) {
		return isFinite(number);
	}
}

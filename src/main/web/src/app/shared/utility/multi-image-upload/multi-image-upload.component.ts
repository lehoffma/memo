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
import {RowAction} from "../material-table/util/row-action";

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

	//contains: images (string[]) + imagesToUpload (ImageToUpload[])
	images$ = new BehaviorSubject<ImageToUpload[]>([]);
	imagePaths$ = this.images$.pipe(
		map(images => images.map(it => it.data))
	);
	@Input() limit: number = Infinity;
	@HostBinding("class.single-picture") singlePicture: boolean = false;
	rowActions: RowAction<ImageToUpload>[] = [
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
	errors: string[];

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
		this.formGroup.get("images").setValue(previousValue);
	}

	_formGroup: FormGroup;

	get formGroup() {
		return this._formGroup;
	}

	@Input() set formGroup(formGroup: FormGroup) {
		this._formGroup = formGroup;

		if (this.previousValue) {
			this.formGroup.get("images").setValue(this.previousValue);
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
		return [...value.images.map(path => ({id: path, name: path, data: path})),
			...value.imagesToUpload];
	}

	/**
	 *
	 * @param fileList
	 * @param errorPredicates
	 */
	private handleErrors(fileList: File[], errorPredicates: { predicate: (file: File) => boolean, error: string }[]) {
		let errors = [];
		let filteredFileList = fileList;
		errorPredicates.forEach(({predicate, error}) => {
			let previousSize = filteredFileList.length;
			filteredFileList = filteredFileList.filter(file => predicate(file));
			if (filteredFileList.length < previousSize) {
				errors.push(error)
			}
		});
		return {filteredFileList, errors};
	}

	/**
	 *
	 * @param {FileList} fileList
	 */
	readImages(fileList: File[]): Observable<ImageToUpload[]> {
		const acceptableFileTypes = ["image/jpeg", "image/png"];
		const maxFileSize = 10000000; //10mb

		const {filteredFileList, errors} = this.handleErrors(fileList, [
			{
				predicate: file => acceptableFileTypes.includes(file.type),
				error: `Nur Bilddateien sind erlaubt. 
Akzeptiert sind: .jpeg, .png`
			},
			{
				predicate: file => file.size <= maxFileSize,
				error: `Bilder größer als 10MB sind nicht erlaubt.`
			}
		]);
		this.errors = errors;

		const value: ImageToUpload[] = Array.from(Array(filteredFileList.length).keys())
			.map(it => ({id: null, name: null, data: null}));
		const addedImages$ = new BehaviorSubject<ImageToUpload[]>(value);

		for (let i = 0; i < filteredFileList.length; i++) {
			(() => {
				const reader = new FileReader();

				reader.onload = (event) => {
					const currentValue = addedImages$.getValue();
					currentValue[i] = ({
						id: filteredFileList[i].name,
						name: filteredFileList[i].name,
						data: (<any>event.target).result
					});
					addedImages$.next(currentValue);
				};

				reader.readAsDataURL(filteredFileList[i]);
			})();
		}

		return addedImages$
			.pipe(
				//only update the list if all images have been read by the file reader
				map(images => images.filter(it => it.id !== null)),
				filter(images => images.length === filteredFileList.length),
				take(1)
			);
	}


	/**
	 *
	 * @param event
	 */
	onFileSelect(event) {
		const fileList: FileList = event.target.files;
		let imagePaths = [...this.formGroup.value.images];
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

				this.formGroup.get("images").setValue(imagePaths, {emitEvent: true});
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
			.map((entry: ImageToUpload) => this.formGroup.get("images").value.indexOf(entry.id))
			.sort();
		const uploaded: ImageToUpload[] = [...this.formGroup.get("imagesToUpload").value];
		for (let i = deletedUploaded.length - 1; i >= 0; i--) {
			uploaded.splice(deletedUploaded[i], 1);
		}

		const previous: string[] = [...this.formGroup.get("images").value];
		for (let i = deletedPrevious.length - 1; i >= 0; i--) {
			previous.splice(deletedPrevious[i], 1);
		}

		this.formGroup.get("imagesToUpload").setValue(uploaded);
		this.formGroup.get("images").setValue(previous);
	}


	isFinite(number: number) {
		return isFinite(number);
	}
}

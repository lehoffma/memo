import {Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ExpandableTableColumn} from "../expandable-table/expandable-table-column";
import {RowActionType} from "../expandable-table/row-action-type";
import {MultiImageUploadService} from "./multi-image-upload.service";
import {filter, map, take} from "rxjs/operators";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Subscription} from "rxjs/Subscription";
import {ModifiedImages} from "../../shop/shop-item/modify-shop-item/modified-images";
import {ImageToUpload, isImageToUpload} from "./image-to-upload";
import {Observable} from "rxjs/Observable";
import {ConfirmationDialogService} from "../services/confirmation-dialog.service";

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

	_previousValue: string[] = [];
	@Input() set previousValue(previousValue: string[]) {
		this._previousValue = previousValue;
		this.formGroup.get("imagePaths").setValue(previousValue);
	}

	get previousValue() {
		return this._previousValue;
	}

	_formGroup: FormGroup = this.formBuilder.group({
		"imagePaths": this.formBuilder.control([]),
		"imagesToUpload": this.formBuilder.control([])
	});

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

	get formGroup() {
		return this._formGroup;
	}

	//contains: imagePaths (string[]) + imagesToUpload (ImageToUpload[])
	images$ = new BehaviorSubject<ImageToUpload[]>([]);
	imagePaths$ = this.images$.pipe(
		map(images => images.map(it => it.data))
	);

	@Input() limit: number = Infinity;
	@HostBinding("class.single-picture") singlePicture: boolean = false;


	columnKeys: ExpandableTableColumn<ImageToUpload>[] = [
		new ExpandableTableColumn<ImageToUpload>("Name", "name")
	];
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

	constructor(public multiImageUploadService: MultiImageUploadService,
				private confirmationDialogService: ConfirmationDialogService,
				private formBuilder: FormBuilder) {
	}

	ngOnInit() {
		this.singlePicture = this.limit === 1;
		this.subscriptions.push(
			this.multiImageUploadService.onAdd.subscribe(
				() => this.fileUpload.nativeElement.click()
			),
			this.multiImageUploadService.onDelete.subscribe(
				entries => this.deleteEntries(entries)
			)
		);
		this.multiImageUploadService.init(this.images$);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
		if (this.imageSubscription) {
			this.imageSubscription.unsubscribe();
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


	deleteEntries(entries: (ImageToUpload)[]) {
		const message = `Möchtest du diese${entries.length === 1 ? "s Bild" : " Bilder"} wirklich löschen?`;
		this.confirmationDialogService.open(message, () => {
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
		})
	}


	isFinite(number: number) {
		return isFinite(number);
	}
}

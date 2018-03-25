import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ExpandableTableColumn} from "../expandable-table/expandable-table-column";
import {RowAction} from "../expandable-table/row-action";
import {MultiImageUploadService} from "./multi-image-upload.service";
import {filter, map, take} from "rxjs/operators";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Subscription} from "rxjs/Subscription";
import {ModifiedImages} from "../../shop/shop-item/modify-shop-item/modified-images";
import {ImageToUpload, isImageToUpload} from "./image-to-upload";

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
	imageSubscription: Subscription;
	subscriptions = [];

	constructor(public multiImageUploadService: MultiImageUploadService,
				private formBuilder: FormBuilder) {
	}

	ngOnInit() {
		this.images$.subscribe(console.log);
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
				this.formGroup.get("imagesToUpload").patchValue(images, {emitEvent: true});
			})
	}


	/**
	 *
	 * @param event
	 */
	onFileSelect(event) {
		const fileList: FileList = event.target.files;
		const fileCount: number = fileList.length;

		//todo consider the imagePaths when calculating the limit

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

		this.addImages(this.currentFiles);
	}


	deleteEntries(entries: (ImageToUpload)[]) {
		const deletedUploaded = entries.filter(it => isImageToUpload(it))
			.map((entry: ImageToUpload) => this.formGroup.get("imagesToUpload").value.findIndex(it => it.id === entry.id))
			.sort();
		const deletedPrevious = entries.filter(it => !isImageToUpload(it))
			.map((entry: ImageToUpload) => this.formGroup.get("imagePaths").value.indexOf(entry.id))
			.sort();
		const uploaded: ImageToUpload[] = this.formGroup.get("imagesToUpload").value;
		for (let i = deletedUploaded.length - 1; i >= 0; i--) {
			uploaded.splice(deletedUploaded[i], 1);
		}

		const previous: string[] = this.formGroup.get("imagePaths").value;
		for (let i = deletedPrevious.length - 1; i >= 0; i--) {
			previous.splice(deletedPrevious[i], 1);
		}

		this.formGroup.get("imagesToUpload").patchValue(uploaded);
		this.formGroup.get("imagePaths").patchValue(previous);
	}


	isFinite(number: number) {
		return isFinite(number);
	}
}

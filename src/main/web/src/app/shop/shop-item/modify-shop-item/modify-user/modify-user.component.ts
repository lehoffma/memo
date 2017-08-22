import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Component({
	selector: "memo-modify-user",
	templateUrl: "./modify-user.component.html",
	styleUrls: ["./modify-user.component.scss"]
})
export class ModifyUserComponent implements OnInit {
	private _model$ = new BehaviorSubject<any>({});
	public model$ = this._model$.asObservable();

	get model() {
		return this._model$.getValue();
	}

	@Input()
	set model(model: any) {
		this._model$.next(model);
	}


	@Input() mode: ModifyType;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
	@Output() onSubmit: EventEmitter<any> = new EventEmitter();
	@Output() watchForAddressModification: EventEmitter<any> = new EventEmitter();

	ModifyType = ModifyType;


	get userModel() {
		return this.model;
	}

	set userModel(model: any) {
		this.model = model;
		this.modelChange.emit(this.model);
	}

	constructor(private location: Location) {
	}

	ngOnInit() {
	}

	cancel() {
		this.location.back();
	}

	submitModifiedObject(event) {
		console.log(event);
		this.onSubmit.emit(this.model);
	}

	emitWatchForAddressModification(model: any) {
		this.watchForAddressModification.emit(model);
	}
}

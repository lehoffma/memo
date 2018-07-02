import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	NgZone,
	OnDestroy,
	OnInit,
	Output,
	QueryList,
	ViewChildren
} from "@angular/core";
import {MapsAPILoader} from "@agm/core";
import {Address, createAddress} from "../../../../../shared/model/address";
import {debounceTime, defaultIfEmpty, filter, map, mergeMap, startWith, take} from "rxjs/operators";
import {RoutingService} from "../../../../shared/services/routing.service";
import {ControlValueAccessor, FormArray, FormBuilder, FormControl, NG_VALUE_ACCESSOR, Validators} from "@angular/forms";
import {AddressService} from "../../../../../shared/services/api/address.service";
import {combineLatest, Observable, Subscription, timer} from "rxjs";
import {GMapsService} from "../../../../shared/services/gmaps.service";
import {MapsGeocodingResult} from "../../../../shared/maps-geocoding-result";
import {addressToString} from "../../../../../shared/model/util/to-string-util";


declare var google;

@Component({
	selector: "memo-tour-route-input",
	templateUrl: "./tour-route-input.component.html",
	styleUrls: ["./tour-route-input.component.scss"],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: TourRouteInputComponent,
		multi: true
	}]
})
export class TourRouteInputComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
	@Input() isTour: boolean = false;
	@Input() formControl: FormControl;
	route$: Observable<Address[]>;

	inputControls: FormArray;
	loading: { [index: number]: boolean } = {};
	@Output() distanceChange = new EventEmitter<number>();
	@ViewChildren("routeInput") inputs: QueryList<ElementRef>;
	_onChange = null;
	centerOfTour$;
	initializedRoute$;
	directionsDisplay;
	showDirective = false;
	subscriptions = [];
	inputCallbackSubscriptions: { [index: number]: Subscription } = {};

	constructor(private mapsAPILoader: MapsAPILoader,
				private gMapsService: GMapsService,
				private formBuilder: FormBuilder,
				private cdRef: ChangeDetectorRef,
				private routingService: RoutingService,
				private addressService: AddressService,
				private ngZone: NgZone) {
	}

	_previousValue = [];

	get previousValue() {
		return this._previousValue;
	}

	@Input() set previousValue(previousValue: number[]) {
		this._previousValue = previousValue;

		if (!previousValue || previousValue.length === 0) {
			this.onChange(this.isTour ? [createAddress(), createAddress()] : [createAddress()]);
			return;
		}

		combineLatest(
			...previousValue.map(id => this.addressService.getById(id))
		)
			.pipe(
				mergeMap(addresses => timer(0, 500)
					.pipe(
						filter(it => !!this.inputControls),
						map(it => addresses)
					)
				),
				take(1)
			)
			.subscribe(addresses => {
				this.onChange(addresses);
				this.clearInputs();
				addresses.forEach((address, index) => {
					this.addInput();
					this.inputControls.at(index).setValue(addressToString(address));
				})
			})
	}

	private _totalDistance = 0;

	get totalDistance() {
		return this._totalDistance
	}

	set totalDistance(distance: number) {
		this._totalDistance = distance;
		this.distanceChange.emit(distance);
	}

	onChange(values: Address[]) {
		timer(0, 500)
			.pipe(
				//hack: sometimes _onChange is not yet initialized when we're attempting to set the value
				filter(it => this._onChange !== null),
				take(1),
				map(it => values)
			)
			.subscribe(values => {
				this._onChange(values);
			})
	}

	ngOnInit() {
		const inputs = this.isTour ? [this.getInput(0), this.getInput(1)] : [this.getInput(0)];
		this.inputControls = this.formBuilder.array(inputs);

		this.centerOfTour$ = this.formControl.valueChanges
			.pipe(
				map(this.routingService.centerOfRoute),
				defaultIfEmpty({
					longitude: 0,
					latitude: 0
				})
			);

		this.formControl.valueChanges.subscribe(it => console.log(it));

		this.initializedRoute$ = this.formControl.valueChanges
			.pipe(
				map(route => route.filter(it => it.longitude !== 0 && it.latitude !== 0)),
				defaultIfEmpty([]),
				startWith([])
			);

		this.route$ = this.formControl.valueChanges;

		if (this.directionsDisplay === undefined) {
			this.mapsAPILoader.load().then(() => {
				this.directionsDisplay = new google.maps.DirectionsRenderer;
				this.showDirective = true;
			});
		}
	}


	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
		Object.keys(this.inputCallbackSubscriptions).forEach(it => this.inputCallbackSubscriptions[it].unsubscribe());
	}

	ngAfterViewInit() {
	}

	getInput(index: number) {
		const input = this.formBuilder.control("", [Validators.required]);

		this.inputCallbackSubscriptions[index] = input.valueChanges
			.pipe(debounceTime(750))
			.subscribe(value => this.search(value, index));
		return input;
	}

	addInput(index?: number) {
		if (!index) {
			this.inputControls.push(this.getInput(this.inputControls.length));
		}
		else {
			this.inputControls.insert(index, this.getInput(index));
		}
	}

	removeInput(index: number) {
		if (this.inputCallbackSubscriptions[index]) {
			this.inputCallbackSubscriptions[index].unsubscribe();
		}
		this.inputControls.removeAt(index);
	}

	clearInputs() {
		Object.keys(this.inputCallbackSubscriptions).forEach(index => this.removeInput(+index));
	}

	search(input: any, index: number) {
		this.loading[index] = true;
		this.gMapsService.getGeocodedAddress(input)
			.subscribe(it => {
				if (!it || Object.keys(it).length === 0 || it.length < 1) {
					this.inputControls.at(index).setErrors({"not-a-valid-address": true}, {emitEvent: true});
					return;
				}
				this.insertStop(it[0], index);
				this.loading[index] = false;
				setTimeout(() => this.cdRef.detectChanges(), 1);
			});
	}

	/**
	 *
	 */
	addNewStop() {
		const currentValue = this.formControl.value;
		const index = currentValue.length - 1;
		currentValue.splice(index, 0, createAddress());
		this.onChange(currentValue);
		this.addInput(index);
	}

	/**
	 *
	 * @param place
	 * @param {number} index
	 */
	insertStop(place: MapsGeocodingResult | any, index: number) {
		const currentValue = this.formControl.value;
		this.onChange([
			...currentValue.slice(0, index),
			this.routingService.transformToMemoFormat(place, currentValue[index]),
			...currentValue.slice(index + 1)
		]);
	}

	/**
	 *
	 * @param index
	 */
	removeStop(index) {
		const currentValue = this.formControl.value;
		currentValue.splice(index, 1);
		this.onChange(currentValue);
		this.removeInput(index);
	}


	//control-value-accessor requirements

	registerOnChange(fn: any): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: any): void {
		//nothing
	}

	setDisabledState(isDisabled: boolean): void {
		if (isDisabled) {
			this.formControl.disable();
		}
		else {
			this.formControl.enable();
		}
	}

	writeValue(obj: Address[]): void {
		this.formControl.setValue(obj);
	}
}

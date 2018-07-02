import {Component, EventEmitter, Input, NgZone, OnInit, Output} from "@angular/core";
import {Address, createAddress} from "../../model/address";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GMapsService} from "../../../shop/shared/services/gmaps.service";
import {first} from "rxjs/operators";
import {addressToString} from "../../model/util/to-string-util";
import {setProperties} from "../../model/util/base-object";

@Component({
	selector: "memo-address-input-form",
	templateUrl: "./address-input-form.component.html",
	styleUrls: ["./address-input-form.component.scss"]
})
export class AddressInputFormComponent implements OnInit {
	@Output() onSubmit: EventEmitter<Address> = new EventEmitter<Address>();
	@Output() onCancel: EventEmitter<any> = new EventEmitter<any>();

	id: number = -1;
	loading = false;
	formGroup: FormGroup;

	constructor(private formBuilder: FormBuilder,
				private zone: NgZone,
				private gmapService: GMapsService) {
		this.formGroup = this.formBuilder.group({
			name: ["", {
				validators: [Validators.required]
			}],
			street: ["", {
				validators: [Validators.required]
			}],
			streetNr: ["", {
				validators: [Validators.required, Validators.pattern(/[0-9a-z]+/i)]
			}],
			zip: ["", {
				//source for regex:
				//http://www.regexlib.com/(A(psxahNa_YrvG--RPW3WOklJZtRtbggPEzl0A50PUvU6oU1ZYXXddckHzmRcTND-sp2Y-pv4dRSy6DpT3IJ2sPYQ7SlZIuBuWIKI8DBFMjeo1))/Search.aspx?k=german+postal+code&c=-1&m=-1&ps=20&AspxAutoDetectCookieSupport=1
				validators: [Validators.required, Validators.pattern(/\b((?:0[1-46-9]\d{3})|(?:[1-357-9]\d{4})|(?:[4][0-24-9]\d{3})|(?:[6][013-9]\d{3}))\b/)]
			}],
			city: ["", {
				validators: [Validators.required]
			}],
			country: ["Deutschland", {
				validators: [Validators.required]
			}]
		});
	}

	@Input() set address(address: Address) {
		this.formGroup.patchValue(({
			name: address.name,
			street: address.street,
			streetNr: address.streetNr,
			zip: address.zip,
			city: address.city,
			country: address.country
		}));
		this.id = address.id;
	}

	ngOnInit() {
	}

	submit() {
		const address = setProperties(createAddress(), {
			id: this.id,
			name: this.formGroup.value.name,
			street: this.formGroup.value.street,
			streetNr: this.formGroup.value.streetNr,
			zip: this.formGroup.value.zip,
			city: this.formGroup.value.city,
			country: this.formGroup.value.country,
		});

		this.loading = true;
		this.gmapService.getGeocodedAddress(addressToString(address))
			.pipe(first())
			.subscribe(results => {
				this.zone.run(() => {
					this.loading = false;
					let addressToSubmit = address;
					if (results && results.length > 0) {
						const longitude = results[0].geometry.location.lng();
						const latitude = results[0].geometry.location.lat();
						addressToSubmit = setProperties(addressToSubmit, {
							latitude,
							longitude
						})
					}
					this.onSubmit.emit(addressToSubmit)
				})
			})
	}

}

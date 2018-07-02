import {Pipe, PipeTransform} from "@angular/core";
import {Address} from "../../../../shared/model/address";
import {addressToString} from "../../../../shared/model/util/to-string-util";

@Pipe({
	name: "address"
})
export class AddressRendererPipe implements PipeTransform {
	transform(address: Address, format: "short" | "long" = "long"): string {
		let addressAsText = "";

		switch (format) {
			case "long":
				addressAsText = addressToString(address);
				break;
			case "short":
				addressAsText = `${address.city}, ${address.country}`;
				break;
		}

		return addressAsText;
	}
}

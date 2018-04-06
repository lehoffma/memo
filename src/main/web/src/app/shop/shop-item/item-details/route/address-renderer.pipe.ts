import {Pipe, PipeTransform} from "@angular/core";
import {Address} from "../../../../shared/model/address";

@Pipe({
	name: "address"
})
export class AddressRendererPipe implements PipeTransform {
	transform(address: Address, format: "short" | "long" = "long"): string {
		let addressAsText = "";

		switch (format) {
			case "long":
				addressAsText = address.toString();
				break;
			case "short":
				addressAsText = `${address.city}, ${address.country}`;
				break;
		}

		return addressAsText;
	}
}

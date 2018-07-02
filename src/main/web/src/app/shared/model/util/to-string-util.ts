import {Address} from "../address";


export function addressToString(address: Address) {
	const ifNotEmpty = (value: string, options: { suffix?: string, prefix?: string } = {suffix: "", prefix: ""}) => {
		return !value ? "" : ifNotEmpty(options && options.prefix) + value + ifNotEmpty(options && options.suffix);
	};

	return address.street + ifNotEmpty(address.streetNr, {prefix: " "}) + ", "
		+ ifNotEmpty(address.zip, {suffix: " "}) + address.city + ", " + address.country;
}

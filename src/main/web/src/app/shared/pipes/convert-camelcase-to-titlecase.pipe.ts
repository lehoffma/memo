import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
	name: "convertCamelcaseToTitlecase"
})
export class ConvertCamelCaseToTitleCasePipe implements PipeTransform {
	transform(value: string): string {
		if (value) {
			//remove leading underscore if present
			if (value.startsWith("_")) {
				value = value.substring(1);
			}
			//convert first character to uppercase
			value = value[0].toUpperCase() + value.substring(1);

			//put space between lowercase letters followed directly by uppercase letters
			return value.replace(/[a-z][A-Z]/g, (match) => (match[0] + " " + match.substring(1)));
		}

		return "";
	}
}

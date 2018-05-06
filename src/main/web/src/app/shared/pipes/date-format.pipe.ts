import {Pipe, PipeTransform} from "@angular/core";
import {format, parse} from "date-fns";
import {isString} from "../../util/util";

@Pipe({
	name: "dateFormat"
})
export class DateFormatPipe implements PipeTransform {
	transform(value: Date | string, formatString: string = "DD.MM.YYYY"): any {
		if (isString(value)) {
			return format(parse(value), formatString);
		}

		return format(value, formatString)
	}
}

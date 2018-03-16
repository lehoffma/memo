import {Pipe, PipeTransform} from "@angular/core";
import {format} from "date-fns";

@Pipe({
	name: "dateFormat"
})
export class DateFormatPipe implements PipeTransform {
	transform(value: Date, formatString: string = "DD.MM.YYYY"): any {
		return format(value, formatString)
	}
}

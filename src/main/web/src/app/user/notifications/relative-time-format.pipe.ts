import {Pipe, PipeTransform} from "@angular/core";
import {format} from "date-fns";

@Pipe({
	name: "relativeTimeFormat"
})
export class RelativeTimeFormatPipe implements PipeTransform {
	transform(value: Date): string {
		//todo date-fns v2
		// return formatDistance()
		return format(value, "DD.MM.YYYY [um] HH:mm");
	}
}

import {Pipe, PipeTransform} from "@angular/core";
import {Observable, timer} from "rxjs";
import {formatDistanceToNow, parseISO} from "date-fns";
import {map} from "rxjs/operators";
import {de as deLocale} from "date-fns/locale";

@Pipe({
	name: "relativeDateFormat"
})
export class RelativeDateFormatPipe implements PipeTransform {

	transform(value: Date | string, interval: number = 5000): Observable<string> {
		let date: Date;
		if (value instanceof Date) {
			date = value;
		} else {
			date = parseISO(value);
		}
		if (!value) {
			date = new Date();
		}

		return timer(0, interval).pipe(
			map(it => formatDistanceToNow(date, {addSuffix: true, locale: deLocale}))
		)
	}

}

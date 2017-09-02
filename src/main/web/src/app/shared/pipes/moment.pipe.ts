import {Pipe, PipeTransform} from '@angular/core';
import {Moment} from "moment";
import * as moment from "moment-timezone";

@Pipe({
	name: 'moment'
})
export class MomentPipe implements PipeTransform {
	transform(value: Moment, format:string): any {
		if(!format){
			return moment.tz(value, "Europe/Berlin").format('DD.MM.YYYY');
		}

		return moment.tz(value, "Europe/Berlin").format(format);
	}
}

import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
	name: "boldNotificationText"
})
export class BoldNotificationTextPipe implements PipeTransform {
	transform(value: string): any {
		return value.replace(/\*([^*]+)\*/g, "<b>$1</b>");
	}
}

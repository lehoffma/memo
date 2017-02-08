import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(values: any[], filteredValues: any[] = []): any {
        return values.filter(value => filteredValues.indexOf(value) === -1);
    }
}
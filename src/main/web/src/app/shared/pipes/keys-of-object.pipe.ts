import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'keysOfObject'
})
export class KeysOfObjectPipe implements PipeTransform {
    transform(object: any, filteredAttributes: string[] = []): string[] {
        if (object) {
            return Object.keys(object).filter(key => filteredAttributes.indexOf(key) === -1);
        }
        return [];
    }
}
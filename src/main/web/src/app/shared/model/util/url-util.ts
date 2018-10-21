import {flatMap} from "../../../util/util";
import {ParamMap} from "@angular/router";


export function getAllQueryValues(paramMap: ParamMap, key: string){
	return flatMap(x => x.split(","), paramMap.getAll(key))
}

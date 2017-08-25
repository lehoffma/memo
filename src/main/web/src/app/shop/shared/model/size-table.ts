import {SizeRanges} from "./size-range";

export interface SizeTable {
	[string: string]: SizeRanges;
}

//Example:
// let test:SizeTable = {
//     "XS": {
//         "Hüftumfang": {
//             "min": 50,
//             "max": 52
//         }
//     }
// }

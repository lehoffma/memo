import {MatDateFormats} from "@angular/material";

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


export const MAT_MOMENT_DATE_FORMATS: MatDateFormats = {
	parse: {
		dateInput: 'l',
	},
	display: {
		dateInput: 'l',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};


/** Creates an array and fills it with values. */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
	const valuesArray = Array(length);
	for (let i = 0; i < length; i++) {
		valuesArray[i] = valueFunction(i);
	}
	return valuesArray;
}


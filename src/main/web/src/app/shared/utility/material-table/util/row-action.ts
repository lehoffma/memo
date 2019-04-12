import {RowActionType} from "./row-action-type";
import {ThemePalette} from "@angular/material";

export interface RowAction<T> {
	icon?: string;
	name: string | RowActionType;
	predicate?: (object: T) => boolean;
	link?: (object: T) => string;
	route?: (object: T) => string;
}

export interface TableAction<T> extends RowAction<T[]> {
	label: string;
	type: "mat-button" | "mat-stroked-button" | "mat-raised-button" | "mat-flat-button" | "mat-icon-button" | "link-button";
	color?: ThemePalette;
}

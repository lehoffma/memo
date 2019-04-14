import {RowActionType} from "./row-action-type";
import {ThemePalette} from "@angular/material";
import {MatMenuPanel} from "@angular/material/typings/menu";

export type RowActionLeaf<T> = Pick<RowAction<T>, Exclude<keyof RowAction<T>, "children">>

export interface RowAction<T> {
	icon?: string;
	children?: RowActionLeaf<T>[];
	name: string | RowActionType;
	predicate?: (object: T) => boolean;
	link?: (object: T) => string;
	route?: (object: T) => string;
}

export interface TableAction<T> extends RowAction<T[]> {
	label: string;
	type: "mat-button" | "mat-stroked-button" | "mat-raised-button" | "mat-flat-button" | "mat-icon-button" | "link-button" |
		"mat-icon-menu";
	//only used for mat-icon-menu actions (e.g. bulk editing)
	menu?: MatMenuPanel<any>;
	color?: ThemePalette;
	tooltip?: string;
}

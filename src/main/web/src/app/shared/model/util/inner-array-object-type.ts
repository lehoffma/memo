import {ArrayObjectType} from "./array-object-type";
import {Cache} from "../../cache/cache.store";

export type InnerArrayObjectType<T extends ArrayObjectType<any>> = MappedArrayObjectType<T>[keyof MappedArrayObjectType<T>];

export type MappedArrayObjectType<T extends ArrayObjectType<any>> = {
	[P in keyof Cache]: Cache[P][0];
	};

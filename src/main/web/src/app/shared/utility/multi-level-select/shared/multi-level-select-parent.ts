import {MultiLevelSelectOption} from "./multi-level-select-option";
import {SelectNode} from "./select-node";

export interface MultiLevelSelectParent extends SelectNode {
	expanded?: boolean;
	selectType: "single" | "multiple" | "date-range" | "by-item";
	//children can be either another parent or a leaf node
	children: MultiLevelSelectOption[];
}

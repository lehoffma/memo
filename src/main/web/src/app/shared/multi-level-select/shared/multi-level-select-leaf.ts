import {SelectNode} from "./select-node";

export interface MultiLevelSelectLeaf extends SelectNode {
	queryValue: string;
	selected: boolean;
}

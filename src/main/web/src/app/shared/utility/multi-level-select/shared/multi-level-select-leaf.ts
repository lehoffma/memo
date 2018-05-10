import {SelectNode} from "./select-node";

export interface MultiLevelSelectLeaf extends SelectNode {
	query: {
		key: string;
		values?: string[];
	}[]
	selected: boolean;
}

import {MultiLevelSelectParent} from "./multi-level-select-parent";
import {MultiLevelSelectLeaf} from "./multi-level-select-leaf";

export type MultiLevelSelectOption = (MultiLevelSelectParent | MultiLevelSelectLeaf);

export function isMultiLevelSelectParent(option: any): option is MultiLevelSelectParent {
	return option && (<MultiLevelSelectParent>option).queryKey !== undefined;
}

export function isMultiLevelSelectLeaf(option: MultiLevelSelectOption): option is MultiLevelSelectLeaf {
	return (<MultiLevelSelectLeaf>option).queryValue !== undefined;
}

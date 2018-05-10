import {MultiLevelSelectParent} from "./multi-level-select-parent";
import {MultiLevelSelectLeaf} from "./multi-level-select-leaf";

export type MultiLevelSelectOption = (MultiLevelSelectParent | MultiLevelSelectLeaf);

export function isMultiLevelSelectParent(option: any): option is MultiLevelSelectParent {
	return option && (<MultiLevelSelectParent>option).selectType !== undefined;
}

export function isMultiLevelSelectLeaf(option: MultiLevelSelectOption): option is MultiLevelSelectLeaf {
	return (<MultiLevelSelectLeaf>option).query !== undefined;
}

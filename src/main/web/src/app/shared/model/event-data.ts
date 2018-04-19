import {Tour} from "../../shop/shared/model/tour";
import {Party} from "../../shop/shared/model/party";
import {Merchandise} from "../../shop/shared/model/merchandise";

export interface EventData {
	tours: Tour[];
	partys: Party[];
	merch: Merchandise[];
}

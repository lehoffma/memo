/**
 * Created by Le on 21.05.2017.
 */

import {Party} from "../../shop/shared/model/party";
import {Tour} from "../../shop/shared/model/tour";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {Entry} from "./entry";
import {User} from "./user";
import {Event} from "../../shop/shared/model/event";

export type ShopItem = User | Entry | Merchandise | Tour | Party | Event;

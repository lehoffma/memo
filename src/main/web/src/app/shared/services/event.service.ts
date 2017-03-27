import {Injectable} from "@angular/core";
import {Merchandise} from "../model/merchandise";
import {Event} from "../model/event";
import {Tour} from "../model/tour";
import {Party} from "../model/party";

@Injectable()
export class EventService {

    constructor() {
    }


    isMerchandise(event: Event): event is Merchandise {
        return (<Merchandise>event).colors !== undefined;
    }

    isTour(event: Event): event is Tour {
        return (<Tour>event).vehicle !== undefined
    }

    isParty(event: Event): event is Party {
        return (<Party>event).emptySeats !== undefined && (<Tour>event).vehicle === undefined;
    }
}
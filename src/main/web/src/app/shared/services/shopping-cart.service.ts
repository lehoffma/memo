import {Injectable} from "@angular/core";
import {EventType} from "../model/event-type";
import {BehaviorSubject, Observable} from "rxjs";

interface ShoppingCartItem {
    id: number,
    amount: number,
    options?: {
        size?: string,
        color?: string,
    }
}
interface ShoppingCartContent {
    merch: ShoppingCartItem[],
    partys: ShoppingCartItem[],
    tours: ShoppingCartItem[]
}


@Injectable()
export class ShoppingCartService {
    private _content: BehaviorSubject<ShoppingCartContent> = new BehaviorSubject({
        merch: [{id: 0, amount: 1, options: {size: "XS", color: "red"}},
            {id: 1, amount: 1, options: {size: "XS", color: "red"}},
            {id: 0, amount: 1, options: {size: "S", color: "red"}}],
        partys: [{id: 1, amount: 1}, {id: 1, amount: 1}],
        tours: [{id: 0, amount: 1}, {id: 1, amount: 1}]
    });
    public content = this._content.asObservable();


    constructor() {

    }

    get amountOfFiles(): Observable<number> {
        return this.content.map(content => [...content.merch, ...content.partys, ...content.tours].length)
    }

    /**
     *
     * @param type die Art des Events (entweder 'merch', 'tours' oder 'partys')
     * @param id die ID des Items, welches entfernt werden soll
     * @param content das content-objekt, aus dem das Item entfernt werden soll
     * @returns {ShoppingCartContent}
     */
    private remove(type: EventType, id: number, content: ShoppingCartContent) {
        let itemIndex = content[type].findIndex(cardItem => cardItem.id === id);
        if (itemIndex) {
            //remove
            content[type].splice(itemIndex, 1);
        }
        //das objekt gibt es nicht :(
        return content;
    }

    /**
     *
     * @param type die Art des Events (entweder 'merch', 'tours' oder 'partys')
     * @param item das Item, welches hinzugefügt werden soll
     * @param content das content-objekt, zu dem das Item hinzugefügt werden soll
     * @returns {ShoppingCartContent}
     */
    private add(type: EventType, item: ShoppingCartItem, content: ShoppingCartContent) {
        //Vergleicht ob das Objekt den gleichen inhalt hat.
        let itemIndex = content[type].findIndex(cardItem => {
            return cardItem.id === item.id
                && cardItem.options
                && cardItem.options.size === item.options.size
                && cardItem.options.color === item.options.color
        });
        //Wenn ja, wird die Anzahl erhöht..
        if (itemIndex !== -1) {
            content[type][itemIndex].amount += item.amount;
        }
        //wenn nein, wird das item hinzugefügt
        else {
            content[type].push(item);
        }
        return content;
    }

    /**
     *
     * @param type die Art des Events (entweder 'merch', 'tours' oder 'partys')
     * @param item das Item welches hinzugefügt werden soll
     */
    public addItem(type: EventType, item: ShoppingCartItem) {
        let newValue = this.add(type, item, this._content.value);
        this._content.next(newValue);
    }

    /**
     *
     * @param type die Art des Events (entweder 'merch', 'tours' oder 'partys')
     * @param id die ID des Items, welches gelöscht werden soll
     */
    public deleteItem(type: EventType, id: number) {
        let newValue = this.remove(type, id, this._content.value);
        this._content.next(newValue);
    }


}


import {Injectable} from '@angular/core';
import {EventType} from "../model/event-type";
import {BehaviorSubject} from "rxjs";

interface ShoppingCartItem {
    id: number,
    amount: number,
    options?: {
        size?: string,
        color?: string,
    }
}
interface ShoppingCartContent{
    merch: ShoppingCartItem[],
    partys: ShoppingCartItem[],
    tours: ShoppingCartItem[]
}


@Injectable()
export class ShoppingCartService {
    private _content : BehaviorSubject<ShoppingCartContent> = new BehaviorSubject({
        merch: [{id: 0,amount: 1,options: {size: "XS", color: "red"}},
            {id: 1,amount: 1,options: {size: "XS", color: "red"}},
            {id: 0,amount: 1,options: {size: "S", color: "red"}}],
        partys: [{id: 1,amount: 1}, {id: 1,amount: 1}],
        tours: [{id: 0,amount: 1}, {id: 1,amount: 1}]
    });
    public content = this._content.asObservable();


    private delete(type: EventType, id: number, content: ShoppingCartContent) {
        let itemIndex = content[type].findIndex(cardItem => cardItem.id === id)
        if (itemIndex) {
            //delete
            content[type].splice(itemIndex, 1);
        }
        //das objekt gibt es nicht :(
        return content;



    }

    private add(type: EventType, item: ShoppingCartItem, content: ShoppingCartContent) {
        // Vergleicht ob das Objekt den gleichen inhalt hat wenn ja wird die anzahl erhöht wenn nein das item hinzugefügt
        let itemIndex = content[type].findIndex(cardItem => {
            return cardItem.id === item.id
                && cardItem.options
                && cardItem.options.size === item.options.size
                && cardItem.options.color === item.options.color
        });
        if (itemIndex !== -1) {
            content[type][itemIndex].amount += item.amount;
        } else {
            content[type].push(item);
        }
        return content;
    }

    constructor() {

    }

    public addItem(type: EventType, item: ShoppingCartItem){
        let newValue = this.add(type, item, this._content.value);
        this._content.next(newValue);
    }
    public deleteItem(type: EventType, id: number){
        let newValue = this.delete(type, id, this._content.value);
        this._content.next(newValue);
    }



}
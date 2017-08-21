

import {BaseObject} from "./util/base-object";

export class BankAccount extends BaseObject<BankAccount>{
	constructor(public id:number,
				public bankName:string,
				public iban:string,
				public bic:string,
				public name:string,


	){
		super(id);
	}

	static create():BankAccount{
		return new BankAccount(-1, "", "", "", "");
	}
}

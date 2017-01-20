import {ClothesSize} from "./clothesSize";
/**
 * Created by le on 20.01.2017.
 */
export interface SizeTable{
    [ClothesSize: string]: string[];
}

let sizeTable : SizeTable;
sizeTable[ClothesSize.XS]=["78-81","82-85","86-89","90-93","94-97"];
sizeTable[ClothesSize.S]=["78-81","82-85","86-89","90-93","94-97"];
sizeTable[ClothesSize.M]=["78-81","82-85","86-89","90-93","94-97"];
sizeTable[ClothesSize.L]=["78-81","82-85","86-89","90-93","94-97"];
sizeTable[ClothesSize.XL]=["78-81","82-85","86-89","90-93","94-97"];
sizeTable[ClothesSize.XXL]=["78-81","82-85","86-89","90-93","94-97"];

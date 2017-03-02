import {Permission} from "./permission";
export class Link {
    constructor(public route: string,
                public icon: string,
                public name: string,
                public minimumPermission?: Permission,
                public drawLineAbove?: boolean,
                public children?: Link[]) {

    }
}
export class Link {
    constructor(public route: string,
                public icon: string,
                public name: string,
                public drawLineAbove?:boolean,
                public children?:Link[]) {

    }
}
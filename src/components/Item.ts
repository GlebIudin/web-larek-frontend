import { IWebLarekData, IWebLarekItemPage } from "../types";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/Events";

export class ItemCard extends Component<IWebLarekItemPage>{
    protected _id: number;
    protected _itemTitle: HTMLElement;
    protected _image: string;
    protected _category: string;
    protected _price: number

    constructor (container: HTMLElement, protected events: IEvents) {
        super(container);
        this._itemTitle = ensureElement('.todo-item__text', this.container);
    }

    set id(value: number) {
        this._id = value;
    }

    set title(value: string) {
        this.setText(this._itemTitle, value);
    }

}
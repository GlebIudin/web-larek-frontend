import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { IWebLarekData, IProductActions } from '../types';



export class ProductComponent extends Component<IWebLarekData> {
	protected _id?: HTMLElement;
	protected _title: HTMLElement;
	protected _description?: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _button?: HTMLButtonElement;
	protected _price: HTMLElement;
	protected _category?: HTMLElement;

	constructor(container: HTMLElement, actions?: IProductActions) {
		super(container);

		this._id = container.querySelector('.basket__item-index');
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._description = container.querySelector('.card__text');
		this._image = container.querySelector('.card__image');
		this._button = container.querySelector('.card__button');
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._category = container.querySelector('.card__category');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	set button(value: string) {
		this.setText(this._button, value);
	}

	toggleButton(state: boolean) {
		this.setDisabled(this._button, state);
	}

	set price(value: number) {
		if (value === null) {
			this.setText(this._price, 'Бесценно');
			this.toggleButton(true);
			this.button = 'Нельзя купить';
		} else {
			this.setText(this._price, `${value} синапсов`);
			this.toggleButton(false);
		}
	}

	get price(): number | null {
		return Number(this._price.textContent);
	}

	set category(value: string) {
		this.setText(this._category, value);
	
		let categoryClass: string;
	
		switch (value) {
			case 'софт-скил':
				categoryClass = 'card__category_soft';
				break;
			case 'хард-скил':
				categoryClass = 'card__category_hard';
				break;
			case 'другое':
				categoryClass = 'card__category_other';
				break;
			case 'дополнительное':
				categoryClass = 'card__category_additional';
				break;
			case 'кнопка':
				categoryClass = 'card__category_button';
				break;
		}
	
		this.toggleClass(this._category, categoryClass);
	}

	get category(): string {
		return this._category.textContent || '';
	}

	set cardID(value: string) {
		this._id.textContent = value;
	}

	get cardID(): string {
		return this._id.textContent || '';
	}
}

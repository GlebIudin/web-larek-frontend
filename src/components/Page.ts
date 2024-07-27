import { Component } from './base/Component';
import { IPage } from '../types';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

export class Page extends Component<IPage> {
	protected _basket: HTMLElement;
	protected _basketCounter: HTMLElement;
	protected _gallery: HTMLElement;
	protected _wrapper: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._basket = ensureElement<HTMLElement>('.header__basket');
		this._basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
		this._gallery = ensureElement<HTMLElement>('.gallery');
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper');

		this._basket.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	set counter(value: number) {
		this.setText(this._basketCounter, String(value));
	}

	set catalog(products: HTMLElement[]) {
		this._gallery.replaceChildren(...products);
	}

	set locked(value: boolean) {
		this.toggleClass(this._wrapper, 'page__wrapper_locked', value);
	}
}

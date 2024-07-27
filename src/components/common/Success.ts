import { Component } from '../base/Component';
import { ISuccess, ISuccessActions } from '../../types';
import { ensureElement } from '../../utils/utils';

export class Success extends Component<ISuccess> {
	protected _totalSum: HTMLElement;
	protected _close: HTMLButtonElement;

	constructor(container: HTMLElement, actions: ISuccessActions) {
		super(container);

		this._totalSum = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);

		this._close = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.container
		);

		if (actions?.onClick) {
			this._close.addEventListener('click', actions.onClick);
		}
	}

	set total(price: number) {
		this.setText(this._totalSum, `Списано ${price.toString()} синапсов`);
	}
}

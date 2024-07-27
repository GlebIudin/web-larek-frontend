import { Component } from '../base/Component';
import { IFormState, IFormsOrder } from '../../types';
import { IEvents } from '../base/events';
import { ensureElement, ensureAllElements } from '../../utils/utils';

export class Form<T> extends Component<IFormState> {
	protected _submit: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', (evt: Event) => {
			const target = evt.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this.container.addEventListener('submit', (evt: Event) => {
			evt.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	protected onInputChange(field: keyof T, value: string) {
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	set valid(value: boolean) {
		this.setDisabled(this._submit, !value);
	}

	set errors(value: string) {
		this.setText(this._errors, value);
	}

	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}

export class FormContacts extends Form<IFormsOrder> {
	protected _phoneNumber: HTMLInputElement;
	protected _emailAdress: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._phoneNumber = container.elements.namedItem('phone') as HTMLInputElement;
		this._emailAdress = container.elements.namedItem('email') as HTMLInputElement;
	}

	set phoneNumber(value: string) {
		this._phoneNumber.value = value;
	}

	set emailAdress(value: string) {
		this._emailAdress.value = value;
	}
}

export class FormPayment extends Form<IFormsOrder> {
	protected _adress: HTMLInputElement;
	protected _buttons: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._adress = container.elements.namedItem('address') as HTMLInputElement;
		this._buttons = ensureAllElements<HTMLButtonElement>('.button_alt',container);

		this._buttons.forEach((button) => {
			button.addEventListener('click', () => {
				this.class = button.name;
			});
		});
	}

	set class(name: string) {
		this._buttons.forEach((button) => {
			this.toggleClass(button, 'button_alt-active', button.name === name);
		});
		this.onInputChange('payment', name);
	}

	set adress(value: string) {
		this._adress.value = value;
	}
}

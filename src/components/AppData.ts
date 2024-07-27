import { Model } from './base/Model';
import {
	IWebLarekData,
	IOrder,
	IOrderAddress,
	IOrderContacts,
	FormErrors,
	IAppState,
	PaymentMethod
} from '../types';

export class AppData extends Model<IAppState> {
	basket: IWebLarekData[] = [];
	catalog: IWebLarekData[];
	order: IOrder = {
		email: '',
		phone: '',
		items: [],
		payment: '',
		address: '',
		total: 0,
	};
	preview: string | null;
	formErrors: FormErrors = {};

	getBasketItems(): IWebLarekData[] {
		return this.basket;
	}

	addToBasket(product: IWebLarekData) {
		this.basket.push(product);
		this.emitChanges('basket:change');
	}

	removeFromBasket(product: IWebLarekData) {
		this.basket = this.basket.filter((item) => item.id !== product.id);
		this.emitChanges('basket:change');
	}

	initBasket() {
		this.basket = [];
		this.emitChanges('basket:change');
	}

	getTotal(): number {
		return this.basket.reduce((sum, item) => sum + item.price, 0);
	}

	setCatalog(products: IWebLarekData[]) {
		this.catalog = products;
		this.emitChanges('products:change', {
			catalog: this.catalog,
		});
	}

	setPreview(product: IWebLarekData) {
		this.preview = product.id;
		this.emitChanges('preview:change', product);
	}

	isProductAlreadyAdded(product: IWebLarekData): boolean {
		return this.basket.some((basketItem) => basketItem.id === product.id);
	}

	setOrder() {
		this.order.items = this.getBasketItems().map((product) => product.id);
		this.order.total = this.getTotal();
	}

	setPayment(paymentInfo: PaymentMethod) {
		this.order.payment = paymentInfo;
		this.validateOrderPaymentMethod();
	}

	setAddress(address: string) {
		this.order.address = address;
		this.validateOrderPaymentMethod();
	}

	setEmail(emailAdress: string): void {
		this.order.email = emailAdress;
		this.validateOrderContacts();
	}

	setPhone(phoneNumber: string): void {
		this.order.phone = phoneNumber;
		this.validateOrderContacts();
	}

	validateOrderPaymentMethod() {
		const errors: typeof this.formErrors = {};
		if (!this.order.payment) {
			errors.payment = 'Выберите способ оплаты';
		}
		if (!this.order.address) {
			errors.address = 'Введите адрес доставки';
		}
		this.formErrors = errors;
		this.events.emit('formPaymentInvalid:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateOrderContacts() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Введите Email';
		}
		if (!this.order.phone) {
			errors.phone = 'Введите номер телефона';
		}
		this.formErrors = errors;
		this.events.emit('formContactsInvalid:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	setOrderField(field: keyof IOrderAddress, value: string) {
		this.order[field] = value;
		if (this.validateOrderPaymentMethod()) {
			this.events.emit('order:ready', this.order);
		}
	}

	setContactsField(field: keyof IOrderContacts, value: string) {
		this.order[field] = value;
		if (this.validateOrderContacts()) {
			this.events.emit('order:ready', this.order);
		}
	}
}
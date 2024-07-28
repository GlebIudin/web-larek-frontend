import { Model } from './base/Model';
import {
	IWebLarekData,
	IOrderMetaInfo,
	IOrderAddress,
	IOrderContacts,
	FormErrors,
	IAppState,
	PaymentMethod,
	IOrder
} from '../types';

export class AppData extends Model<IAppState> {
	basket: IWebLarekData[] = [];
	catalog: IWebLarekData[];
	orderInfo: IOrderMetaInfo = {
		email: '',
		phone: '',
		payment: '',
		address: '',
	};
	preview: string | null;
	formErrors: FormErrors = {};

	addToBasket(product: IWebLarekData) {
		this.basket.push(product);
		this.emitChanges('basket:change');
	}

	removeFromBasket(product: IWebLarekData) {
		this.basket = this.basket.filter((item) => item.id !== product.id);
		this.emitChanges('basket:change');
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

	getBasketItems(): IWebLarekData[] {
		return this.basket;
	}

	initBasket() {
		this.basket = [];
		this.emitChanges('basket:change');
	}

	getTotal(): number {
		return this.basket.reduce((sum, item) => sum + item.price, 0);
	}

	isProductAlreadyAdded(product: IWebLarekData): boolean {
		return this.basket.some((basketItem) => basketItem.id === product.id);
	}

	getOrder(): IOrder { 
		return {
			...this.orderInfo,
			total: this.getTotal(),
			items: this.basket.map((item) => item.id)
		}
	}

	setPayment(paymentInfo: PaymentMethod) {
		this.orderInfo.payment = paymentInfo;
		this.validateOrderPaymentMethod();
	}

	setAddress(address: string) {
		this.orderInfo.address = address;
		this.validateOrderPaymentMethod();
	}

	setEmail(emailAdress: string): void {
		this.orderInfo.email = emailAdress;
		this.validateOrderContacts();
	}

	setPhone(phoneNumber: string): void {
		this.orderInfo.phone = phoneNumber;
		this.validateOrderContacts();
	}

	setOrderField(field: keyof IOrderAddress, value: string) {
		this.orderInfo[field] = value;
		if (this.validateOrderPaymentMethod()) {
			this.events.emit('order:ready', this.orderInfo);
		}
	}

	setContactsField(field: keyof IOrderContacts, value: string) {
		this.orderInfo[field] = value;
		if (this.validateOrderContacts()) {
			this.events.emit('order:ready', this.orderInfo);
		}
	}

	validateOrderPaymentMethod() {
		const errors: typeof this.formErrors = {};
		if (!this.orderInfo.payment) {
			errors.payment = 'Выберите способ оплаты';
		}
		if (!/^[а-яА-Я0-9,\.\s]+$/.test(this.orderInfo.address)) {
			errors.address = 'Невалидный адрес';
		}
		if (!this.orderInfo.address) {
			errors.address = 'Введите адрес доставки';
		}
		this.formErrors = errors;
		this.events.emit('formPaymentInvalid:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateOrderContacts() {
		const errors: typeof this.formErrors = {};
		if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$$/.test(this.orderInfo.email)) {
			errors.email = 'Невалидная почта';
		}
		if (!this.orderInfo.email) {
			errors.email = 'Введите Email';
		}
		if (!/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/.test(this.orderInfo.phone)) {
			errors.phone = 'Невалидный телефон';
		}
		if (!this.orderInfo.phone) {
			errors.phone = 'Введите номер телефона';
		}
		this.formErrors = errors;
		this.events.emit('formContactsInvalid:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
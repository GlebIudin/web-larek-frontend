export interface IWebLarekData {
	id: string;
	title: string;
	description?: string;
	category: string;
	price: number | null;
	image: string;
}

export interface IWebLarekProduct extends IWebLarekData {
	buttonTitle?: string;
	cardIndex?: string;
}

export interface IBasket {
	id: string;
	price: number;
	total: number;
	items: string[];
}

export interface IFormsOrder {
	email: string;
	phone: string;
	address: string;
	payment: string;
	buttons: string[];
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IProductActions {
	onClick: (event: MouseEvent) => void;
}

export interface ISuccessActions {
	onClick: () => void;
}

export type PaymentMethod = 'cash' | 'card';

export interface IOrderAddress {
	address: string;
	payment: string;
}

export interface IOrderContacts {
	email: string;
	phone: string;
}

export interface IOrder extends IOrderAddress, IOrderContacts {
	items: string[];
	total: number;
}

export interface IOrderResult {
	id: string;
	total: number;
}

export interface IAppState {
	catalog: IWebLarekData[];
	basket: string[];
	order: IFormsOrder | null;
}

export interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

export interface IModal {
	content: HTMLElement;
}

export interface IFormState {
	valid: boolean;
	errors: string[];
}

export interface ISuccess {
	total: number;
}

export interface IWebShopApi {
	getProductList: () => Promise<IWebLarekData[]>;
	getProductItem: (id: string) => Promise<IWebLarekData>;
	postUserOrder: (order: IOrder) => Promise<IOrderResult>;
}

export type CatalogEvents = {
	catalog: IWebLarekData[];
};
import { Api, ApiListResponse } from './base/api';
import { IOrder, IOrderResult, IWebLarekData, IWebShopApi } from '../types';

export class WebShopApi extends Api implements IWebShopApi {
	readonly _url: string;

	constructor(url: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this._url = url;
	}

	getProductItem(id: string): Promise<IWebLarekData> {
		return this.get('/product/' + id).then((product: IWebLarekData) => ({
			...product,
			image: this._url + product.image,
		}));
	}

	getProductList(): Promise<IWebLarekData[]> {
		return this.get('/product').then((data: ApiListResponse<IWebLarekData>) =>
			data.items.map((item) => ({
				...item,
				image: this._url + item.image,
			}))
		);
	}

	postUserOrder(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then((data: IOrderResult) => data);
	}
}

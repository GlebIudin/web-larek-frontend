// Интерфейсы товаров на сайте

export interface IWebLarekData {
    id: number;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number
  }

export type IWebLarekItemPage = Pick<IWebLarekData, 'id' | 'title' | 'image' | 'price' | 'category'>

export type IWebLarekItem = Pick<IWebLarekData, 'id' | 'title' | 'category' | 'price'>

export type IWebLarekItemBasket = Pick<IWebLarekData, 'id' | 'title' | 'price'>

// Интерфейсы связанные с формами на сайте

export interface IFormData {
  address: string
  payment: string
  emailAdress: string
  phoneNumber: string
}

export type FormErrors = Partial<Record<keyof IFormData, string>>;

export interface IAppDataForm {
  form: IFormData;
  formErrors: FormErrors
}

// Интерфейсы связанные с корзиной

export interface IAppDataBasket {
  items: Map<string, number>;
  add(id: string): void;
  remove(id: string): void
}
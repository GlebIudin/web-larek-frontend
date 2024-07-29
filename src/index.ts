import './scss/styles.scss';
import { cloneTemplate, ensureElement } from './utils/utils';
import { API_URL, CDN_URL } from './utils/constants';
import { WebShopApi } from './components/WebShopApi';
import { EventEmitter } from './components/base/events';
import { AppData } from './components/AppData';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { BasketComponent } from './components/common/BasketComponent';
import { FormPayment, FormContacts } from './components/common/Form';
import { Success } from './components/common/Success';
import { ProductComponent } from './components/ProductComponent';
import { IOrderAddress, IOrderContacts, IWebLarekData, CatalogEvents } from './types';

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const webShopApi = new WebShopApi(CDN_URL, API_URL);
const events = new EventEmitter();
const appState = new AppData({}, events);
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new BasketComponent(cloneTemplate(basketTemplate), events);
const paymentsForm = new FormPayment(cloneTemplate(orderTemplate), events);
const contactsForm = new FormContacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
	onClick: () => modal.close(),
});

// Функция для рендера карточки продукта
function renderProductCard(product: IWebLarekData) {
	const card = new ProductComponent(cloneTemplate(cardCatalogTemplate), {
		onClick: () => events.emit('card:select', product),
	});
	return card.render({
		id: product.id,
		title: product.title,
		image: product.image,
		price: product.price,
		category: product.category,
	});
}

function updatePage() {
	// Обновление каталога товаров
	page.catalog = appState.catalog.map(renderProductCard);
	// Обновление счетчика товаров в корзине
	page.counter = appState.getBasketItems().length;
}

// Функция создания карточки продукта
function createProductCard(product: IWebLarekData): ProductComponent {
	const card: ProductComponent = new ProductComponent(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			// Обработка клика по карточке
			events.emit('card:basket', product);
			// Обновление текста кнопки карточки
			card.button = appState.isProductAlreadyAdded(product) ? 'Убрать' : 'В корзину';
		}
	});

	// Установка начального состояния кнопки
	card.button = appState.isProductAlreadyAdded(product) ? 'Убрать' : 'В корзину';

	return card;
}

// Функция рендера модального окна с карточкой продукта
function renderProductModal(card: ProductComponent, product: IWebLarekData): void {
	modal.render({
		content: card.render({
			id: product.id,
			title: product.title,
			image: product.image,
			price: product.price,
			category: product.category,
			description: product.description,
		}),
	});
}

function toggleProductInBasket(product: IWebLarekData) {
	const isProductInBasket = appState.basket.includes(product);

	if (isProductInBasket) {
		events.emit('basket:remove', product);
	} else {
		events.emit('basket:add', product);
	}

	return appState.getTotal(); // Возвращает актуальное кол-во продуктов в корзине
}

// Рендерим модалку корзины
function renderBasketModal() {
	const total = appState.getTotal();
	const basketContent = basket.render({ price: total });

	modal.render({
		content: basketContent,
	});
}

// Функция обновления инфы в корзине
function updateBasketItems() {
	// Обновляем содержимое корзины
	basket.items = appState.basket.map((product, id) => {
		const card = new ProductComponent(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('basket:remove', product);
			},
		});

		return card.render({
			cardIndex: (id + 1).toString(),
			title: product.title,
			price: product.price,
		});
	});

	// Обновляем общие данные корзины
	basket.total = appState.getTotal();
	page.counter = appState.basket.length;
}

// Универсальная функция для открытия модалок форм по флагу
const renderModal = (formType: string) => {
	let content;

	if (formType === 'order') {
		content = paymentsForm.render({
			payment: '',
			address: '',
			valid: false,
			errors: [],
		});
		paymentsForm.updateButtonClasses(appState.getOrder().payment ?? '');
	} else if (formType === 'contacts') {
		content = contactsForm.render({
			phone: '',
			email: '',
			payment: '',
			valid: false,
			errors: [],
		});
	}

	modal.render({
		content,
	});
};

function handleOrderChange(data: { field: keyof IOrderAddress, value: string }) {
	const { field, value } = data;
	appState.setOrderField(field, value);
}

function handleContactChange(data: { field: keyof IOrderContacts, value: string }) {
	const { field, value } = data;
	appState.setContactsField(field, value);
}

// Обработка ошибок адреса
function handlePaymentsErrors(errors: Partial<IOrderAddress>) {
	const { address, payment } = errors;
	paymentsForm.valid = !payment && !address;
	paymentsForm.errors = formatErrors({ payment, address });
}

// Обработка ошибок контактов
function handleContactsErrors(errors: Partial<IOrderContacts>) {
	const { email, phone } = errors;
	contactsForm.valid = !email && !phone;
	contactsForm.errors = formatErrors({ email, phone });
}

// Форматирование ошибок
function formatErrors(errorObject: {}) {
	return Object.values(errorObject)
		.filter((i) => !!i)
		.join('; ');
}

// Получаем данные с сервера 
webShopApi
	.getProductList()
	.then(appState.setCatalog.bind(appState))
	.catch(console.error);

// Обработчик события, который размещает заказ и обновляет интерфейс
function handleContactSubmit() {
	webShopApi.postUserOrder(appState.getOrder())
		.then(() => {
			// Успешный ответ
			page.counter = appState.basket.length; // Обновляем счетчик корзины
			modal.render({ // Отображаем модальное окно с успехом
				content: success.render({
					total: appState.getTotal(),
				}),
			});
			appState.initBasket(); // Очищаем корзину
		})
		.catch((error: string) => {
			// Обработка ошибок
			console.error(error);
		})
		.finally(function resetForms() {
			contactsForm.reset();
			paymentsForm.reset();
		});
}

// Подписки
events.on('contacts:submit', handleContactSubmit);

events.on('basket:open', renderBasketModal);

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

events.on('order:open', () => {
	appState.resetOrderInfo(); // Сброс состояния формы
	renderModal('order');
});

events.on('order:submit', () => {
	renderModal('contacts');
});

events.on('card:basket', (product: IWebLarekData) => {
	toggleProductInBasket(product);
});

events.on('basket:add', (product: IWebLarekData) => {
	appState.addToBasket(product);
});

events.on('basket:remove', (product: IWebLarekData) => {
	appState.removeFromBasket(product);
});

events.on('formPaymentInvalid:change', handlePaymentsErrors);

events.on('formContactsInvalid:change', handleContactsErrors);

events.on<CatalogEvents>('products:change', () => {
	updatePage()
});

events.on(/^order\..*:change/, handleOrderChange);

events.on(/^contacts\..*:change/, handleContactChange);

events.on('card:select', (product: IWebLarekData) => {
	appState.setPreview(product);
});

events.on('preview:change', (product: IWebLarekData) => {
	const card = createProductCard(product);
	renderProductModal(card, product);
});

events.on('basket:change', updateBasketItems);
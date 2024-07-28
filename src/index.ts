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
import { IOrderAddress, IOrderContacts, IWebLarekData, CatalogEvents, IWebLarekProduct } from './types';

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

// Функция для обновления каталога на странице
function updateCatalog() {
	page.catalog = appState.catalog.map(renderProductCard);
}

// Функция для обновления счетчика товаров в корзине
function updateCounter() {
	page.counter = appState.getBasketItems().length;
}

// Функция создания карточки продукта
function createProductCard(product: IWebLarekData): ProductComponent {
	const card: ProductComponent = new ProductComponent(cloneTemplate(cardPreviewTemplate), {
		onClick: () => handleCardClick(product, card),
	});

	// Установка начального состояния кнопки
	updateCardButton(card, product);

	return card;
}

// Функция обработки клика по карточке
function handleCardClick(product: IWebLarekData, card: ProductComponent): void {
	events.emit('card:basket', product);
	updateCardButton(card, product);
}

// Функция для обновления текста кнопки карточки
function updateCardButton(card: ProductComponent, product: IWebLarekData): void {
	card.button = appState.isProductAlreadyAdded(product) ? 'Убрать' : 'В корзину';
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

function updateBasketItems() {
	basket.items = appState.basket.map((product, id) => createBasketItemCard(product, id));
}

// Создаем и рендерим карточку продукта
function createBasketItemCard(product: IWebLarekProduct, cardIndex: number) {
	const card = new ProductComponent(cloneTemplate(cardBasketTemplate), {
		onClick: () => {
			events.emit('basket:remove', product);
		},
	});

	return card.render({
		cardIndex: (cardIndex + 1).toString(),
		title: product.title,
		price: product.price,
	});
}

// Функция для установки поля заказа
function updateOrderField(field: keyof IOrderAddress, value: string) {
	appState.setOrderField(field, value);
}

// Функция для обработки события изменения заказа
function handleOrderChange(data: { field: keyof IOrderAddress, value: string }) {
	const { field, value } = data;
	updateOrderField(field, value);
}

// Универсальная функция для открытия модалок по флагу
const renderModal = (formType: string) => {
	let content;

	if (formType === 'order') {
		content = paymentsForm.render({
			payment: '',
			address: '',
			valid: false,
			errors: [],
		});
		paymentsForm.updateButtonClasses();
	} else if (formType === 'contacts') {
		content = contactsForm.render({
			phone: '',
			email: '',
			payment: '',
			valid: false,
			errors: [],
		});
		//contactsForm.updateButtonClasses();
	}

	modal.render({
		content,
	});
};

function handleContactChange(data: { field: keyof IOrderContacts, value: string }) {
	const { field, value } = data;
	updateContactsField(field, value);
}

function updateContactsField(field: keyof IOrderContacts, value: string) {
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


function resetForms() {
	contactsForm.reset();
	paymentsForm.reset();
}	

// Функция-обработчик события, в которой вызывается установка заказа и размещение заказа.
function handleContactSubmit() {
	placeOrder()
		.then(handleOrderSuccess)
		.catch(handleOrderError)
		.finally(resetForms);
}

// Функция, которая вызывает API для размещения заказа и возвращает промис
function placeOrder() {
	return webShopApi.postUserOrder(appState.getOrder());
}

// Функция, обрабатывающая успешный ответ при размещении заказа.
function handleOrderSuccess() {
	updatePageCounter();
	renderSuccessModal();
	clearBasket();
}

// Функция для обработки ошибок, возникающих при размещении заказа.
function handleOrderError(error: string) {
	console.error(error);
}

// Обновляет счетчик на странице.
function updatePageCounter() {
	page.counter = appState.basket.length;
}

// Отвечает за отображение модального окна с сообщением об успехе.
function renderSuccessModal() {
	modal.render({
		content: success.render({
			total: appState.getTotal(),
		}),
	});
}

// Очищает корзину.
function clearBasket() {
	appState.initBasket();
}

// Подписки
events.on('contacts:submit', handleContactSubmit);

events.on('basket:open', renderBasketModal);

events.on('basket:change', () => {
	updateBasketItems();
	basket.total = appState.getTotal();
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

events.on('order:open', () => {
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

events.on('basket:change', () => {
	page.counter = appState.basket.length;
});

events.on('formPaymentInvalid:change', handlePaymentsErrors);

events.on('formContactsInvalid:change', handleContactsErrors);

events.on<CatalogEvents>('products:change', () => {
	updateCatalog();
	updateCounter();
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
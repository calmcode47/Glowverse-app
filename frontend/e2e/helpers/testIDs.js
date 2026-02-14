export const TestIDs = {
  LOGIN: {
    SCREEN: "loginScreen",
    EMAIL_INPUT: "loginScreen.emailInput",
    PASSWORD_INPUT: "loginScreen.passwordInput",
    SUBMIT_BUTTON: "loginScreen.submitButton",
    FORGOT_PASSWORD: "loginScreen.forgotPasswordLink",
    REGISTER_LINK: "loginScreen.registerLink",
  },
  PRODUCT_LIST: {
    SCREEN: "productListScreen",
    PRODUCT_CARD: (id) => `productListScreen.productCard.${id}`,
    PRODUCT_CARD_IMAGE: (id) => `productListScreen.productCard.${id}.image`,
    FILTER_BUTTON: "productListScreen.filterButton",
    SORT_BUTTON: "productListScreen.sortButton",
  },
  PRODUCT_DETAIL: {
    SCREEN: "productDetailScreen",
    PRODUCT_NAME: "productDetailScreen.productName",
    PRODUCT_PRICE: "productDetailScreen.productPrice",
    ADD_TO_CART_BUTTON: "productDetailScreen.addToCartButton",
    SIZE_OPTION: (size) => `productDetailScreen.sizeOption.${size}`,
  },
  CART: {
    SCREEN: "cartScreen",
    ITEM: (id) => `cartScreen.item.${id}`,
    CHECKOUT_BUTTON: "cartScreen.checkoutButton",
    PROMO_CODE_INPUT: "cartScreen.promoCodeInput",
  },
  CHECKOUT: {
    SCREEN: "checkoutScreen",
    SHIPPING_NAME_INPUT: "checkoutScreen.shippingNameInput",
    PAYMENT_CARD_NUMBER: "checkoutScreen.paymentCardNumber",
    PLACE_ORDER_BUTTON: "checkoutScreen.placeOrderButton",
  },
  PROFILE: {
    SCREEN: "profileScreen",
    NAME: "profileScreen.name",
    LOGOUT_BUTTON: "profileScreen.logoutButton",
  },
  COMMON: {
    LOADING_INDICATOR: "common.loadingIndicator",
    ERROR_MESSAGE: "common.errorMessage",
    RETRY_BUTTON: "common.retryButton",
  },
  TAB_BAR: {
    HOME: "tabBar.home",
    SHOP: "tabBar.shop",
    CART: "tabBar.cart",
    PROFILE: "tabBar.profile",
    SEARCH: "tabBar.search",
  },
};

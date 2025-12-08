export enum BillingPortalFlowType {
    SubCancel = "subscription_cancel",
    SubUpdate = "subscription_update",
    SubConfirm = "subscription_update_confirm",
    PayementUpdate = "payment_method_update",
    StandartFlow = "",
}

export enum CreditAmount {
    Free = 5,
    Basic = 30,
    Standart = 100,
    Premium = 500,
}

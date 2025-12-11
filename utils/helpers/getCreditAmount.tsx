import { CreditAmount } from "../Enums";
import { IS_PRODUCTION } from "../env";


const getCreditAmount = (plan: string | null) => {
    switch (plan) {
        case IS_PRODUCTION ? "Basic" : "Basic-Test":
            return CreditAmount.Basic;
        case IS_PRODUCTION ? "Standart" : "Standart-Test":
            return CreditAmount.Standart;
        case IS_PRODUCTION ? "Premium" : "Premium-Test":
            return CreditAmount.Premium;
        default:
            return CreditAmount.Free;
    }
};

export default getCreditAmount;
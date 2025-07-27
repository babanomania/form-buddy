export function createPredictiveValidatorAgent(validate) {
    return {
        check(_field, value) {
            return validate(value);
        },
    };
}

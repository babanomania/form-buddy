export function createSubmissionAdvisorAgent(requiredFields) {
    return {
        canSubmit(hints) {
            return requiredFields.every((f) => !hints[f]);
        },
    };
}

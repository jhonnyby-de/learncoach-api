export function validateFields(fields, body) {
    for (const field of fields) {
        if (!body[field]) {
            return `Missing field: ${field}`;
        }
    }
    return null;
}
const validateFields = (fields: Record<string, any>) => {
    for (const [key, value] of Object.entries(fields)) {
        if (!value && value !== 0 || value === "" || value === null) {
            return `El campo ${key} es obligatorio`;
        }
    }
    return null;
};

const generateUniqueId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export { validateFields, generateUniqueId };

const validateFields = (fields: Record<string, unknown>): string | null => {
  for (const [key, value] of Object.entries(fields)) {
    if (value !== null && value !== '' && value !== 0 && value !== undefined) {
      continue
    }
    return `El campo ${key} es obligatorio`
  }
  return null
}
const isNulledFields = (fields: unknown[]): boolean => {
  for (const value of fields) {
    if (value === null || value === '' || value === 0 || value === undefined) {
      return true
    }
  }
  return false
}
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export { validateFields, generateUniqueId, isNulledFields }

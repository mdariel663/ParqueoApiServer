const validateFields = (fields: Record<string, any>): string | null => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value && value !== 0 || value === '' || value === null) {
      return `El campo ${key} es obligatorio`
    }
  }
  return null
}
const isNulledFields = (fields: any[]): boolean => {
  for (const value of fields) {
    if (value === null || value === '' || value === 0 || value === undefined) {
      return true
    }
  }
  console.log(fields)
  return false
}
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export { validateFields, generateUniqueId, isNulledFields }

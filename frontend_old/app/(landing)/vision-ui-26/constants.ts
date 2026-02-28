export const BASE_PATH = '/vision-ui-26'
export const generateUrl = (path?: string) => `${BASE_PATH}${path ? `/${path}` : ''}`

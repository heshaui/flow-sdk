import axios from 'axios'
import apiConfig from './apiConfig'
const api = axios.create({
    timeout: 1000000,
    responseType: 'json'
})

export default apiConfig(api)

export const baseUrl_default = 'http://192.168.0.187:8084'

import axios from 'axios'
import apiConfig from './apiConfig'
const api = axios.create({
    baseURL: '/obc/api',
    timeout: 1000000,
    responseType: 'json'
})

export default apiConfig(api)

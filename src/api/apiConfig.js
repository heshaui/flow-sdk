import { Message } from 'element-ui'

function apiConfig(api) {
    // 提交
    api.interceptors.request.use(
        request => {
            if (localStorage.token) {
                request.headers.Authorization = localStorage.token
            }
            return request
        }
    )

    // 响应
    api.interceptors.response.use(
        response => {
            if (response.data) {
                if (response.data instanceof Blob || response.data.code == 0 || response.data.code == '0000' && response.data.msg === 'success') {
                    return Promise.resolve(response.data)
                } else if (response.data.message) {
                    Message.error(response.data.message)
                    return Promise.reject(response.data)
                } else {
                    Message.error(response.data.msg)
                    return Promise.reject(response.data)
                }
            } else {
                return Promise.resolve(response)
            }
        },
        async error => {
            if (error && error.response) {
                Message.error({
                    message: error.response.data?.msg ?? error
                })
                return Promise.reject(error)
            }
        }
    )
    return api
}

export default apiConfig

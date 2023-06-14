// ivr管理服务
import api, { baseUrl_default } from './index'

// 获取企业列表
export function getIvrList(baseUrl, params) {
    return api.get('/obc/api/ivr/page', {
        params: params,
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 添加企业详情
export function creatIvr(baseUrl, params) {
    return api.post('/obc/api/ivr/create', params, {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 编辑企业详情
export function editIvr(baseUrl, id, params) {
    return api.put(`/obc/api/ivr/${id}`, params, {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 删除ivr
export function delIvrTem(baseUrl, id) {
    return api.delete(`/obc/api/ivr/${id}`, {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 查询ivr详情
export function getIvrData(baseUrl, id) {
    return api.get(`/obc/api/ivr/${id}`, {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

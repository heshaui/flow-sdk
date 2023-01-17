// ivr管理服务
import api from './index'

// 获取企业列表
export function getIvrList(params) {
    return api.get('/ivr/page', {
        params: params
    })
}

// 添加企业详情
export function creatIvr(params) {
    return api.post('/ivr/create', params)
}

// 编辑企业详情
export function editIvr(id, params) {
    return api.put(`/ivr/${id}`, params)
}

// 删除ivr
export function delIvrTem(id) {
    return api.delete(`/ivr/${id}`)
}

// 查询ivr详情
export function getIvrData(id) {
    return api.get(`/ivr/${id}`)
}

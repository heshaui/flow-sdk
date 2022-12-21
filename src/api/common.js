import api from './index'
import qs from 'qs'
// 获取企业列表
export function getCompanyList() {
    return api.get('/admin/company/all')
}

// 获取用户列表
export function getUserList() {
    return api.get('/user/list')
}

// 获取网关组id
export function getGatewayGroupId() {
    return api.get('/admin/sip/gwgroup/list')
}

// 获取行业列表
export function getBusinessList() {
    return api.get('/admin/industry/all')
}

// 获取角色列表 /role/list
export function getRoleList() {
    return api.get('/role/list')
}

// 获取主叫列表
export function getCallerList(id) {
    return api.get('/callnum/pool/list', {
        params: { companyId: id }
    })
}

// 获取技能组列表
export function getSkills(params) {
    return api.get('/group/list', {
        params: params
    })
}

// 获取未绑定外显号码列表
export function getFreeCallnum() {
    return api.get('/callnum/list')
}

// 获取座席列表
export function getSeatsList(params) {
    return api.get('/agent/list', {
        params: params
    })
}

// 获取sip列表
export function getSipList() {
    return api.get('/sip/user/list')
}

// 获取权限列表
export function getPermission() {
    return api.get('/permission')
}

// 获取表单列表
export function getFormList() {
    return api.get('/form/list')
}

// 获取企业并发数
export function getLimit(id) {
    return api.get(`/admin/surplusLimit/${id}`)
}

// 获取ivr列表
export function getIvrList(params) {
    return api.get('/ivr/list', {
        params: params
    })
}

// 获取入参类型表
export function getParamType() {
    return api.get('/input/format/all')
}

// 公共下载方法
export function getTemplate(url) {
    return api.get(url)
}

// 语音上传服务
export function uploadFile(params) {
    return api.post('/ivr/importAudio', params, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 获取音色
export function getTimbre() {
    return api.get('/tone/list')
}

// 获取问卷调查模板
export function getQTemplates() {
    return api.get('/ivr/statistics/list')
}

// 获取语音通知模版列表
export function getTemList(params) {
    return api.get('/template/select/list', {
        params: params
    })
}

// 登录
export function login(params) {
    return api.post('/login', qs.stringify(params))
}

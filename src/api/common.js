import api, { baseUrl_default } from './index'
import qs from 'qs'

// 获取企业列表
export function getCompanyList(baseUrl) {
    return api.get('/obc/api/admin/company/all', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取用户列表
export function getUserList(baseUrl) {
    return api.get('/obc/api/user/list', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取网关组id
export function getGatewayGroupId(baseUrl) {
    return api.get('/obc/api/admin/sip/gwgroup/list', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取行业列表
export function getBusinessList(baseUrl) {
    return api.get('/obc/api/admin/industry/all', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取角色列表 /role/list
export function getRoleList(baseUrl) {
    return api.get('/obc/api/role/list', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取主叫列表
export function getCallerList(baseUrl,id) {
    return api.get('/obc/api/callnum/pool/list', {
        params: { companyId: id },
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取技能组列表
export function getSkills(baseUrl,params) {
    return api.get('/obc/api/group/list', {
        params: params,
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取未绑定外显号码列表
export function getFreeCallnum(baseUrl) {
    return api.get('/obc/api/callnum/list', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取座席列表
export function getSeatsList(baseUrl,params) {
    return api.get('/obc/api/agent/list', {
        params: params,
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取sip列表
export function getSipList(baseUrl) {
    return api.get('/obc/api/sip/user/list', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取权限列表
export function getPermission(baseUrl) {
    return api.get('/obc/api/permission', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取表单列表
export function getFormList(baseUrl) {
    return api.get('/obc/api/form/list', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取企业并发数
export function getLimit(baseUrl,id) {
    return api.get(`obc/api/admin/surplusLimit/${id}`, {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取ivr列表
export function getIvrList(baseUrl,params) {
    return api.get('/obc/api/ivr/list', {
        params: params,
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取入参类型表
export function getParamType(baseUrl) {
    return api.get('/obc/api/input/format/all', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 公共下载方法
export function getTemplate(baseUrl,url) {
    return api.get(url, {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 语音上传服务
export function uploadFile(baseUrl,params) {
    return api.post('/obc/api/ivr/importAudio', params, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取音色
export function getTimbre(baseUrl) {
    return api.get('/obc/api/tone/list', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取问卷调查模板
export function getQTemplates(baseUrl) {
    return api.get('/obc/api/ivr/statistics/list', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取语音通知模版列表
export function getTemList(baseUrl,params) {
    return api.get('/obc/api/template/select/list', {
        params: params,
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 登录
export function login(baseUrl, params) {
    return api.post('/obc/api/login', qs.stringify(params), {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取token
export function getToken(baseUrl, params) {
    return api.post('/obc/api/token', params, {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}


// 获取录音列表
export function getLainList(baseUrl, params) {
    return api.get('/obc/api/audio/queryList', { 
        params,
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 保存铃音，url形式
export function saveLain(baseUrl, params) {
    return api.post('/obc/api/audio/save', params, {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 上传录音，文件
export function uploadLain(baseUrl, params) {
    return api.post('/obc/api/audio/import', params, {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

// 获取自定义字段
export function getField(baseUrl) {
    return api.get('/obc/api/customer/header', {
        baseURL: baseUrl ? baseUrl : baseUrl_default
    })
}

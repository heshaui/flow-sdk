/* eslint-disable no-unused-vars */
import Vue from "vue";
import './easyFlow/index.css'
import './easyFlow/reset.scss'
import main from "./easyFlow/main.vue"
import { login, getToken } from '@/api/common'
import Base64 from './easyFlow/base64'
import ElementUI from 'element-ui'
Vue.use(ElementUI, {zIndex: 300000});


class JsSDK {
  constructor(options, callback) {
    JsSDK.render(options, callback);
  }

  static onlogin () {
    const username = this.options.username
    const password = this.options.password
    const base64 = new Base64()
    const pass = base64.encode(password)
    login(this.options.baseUrl, {
      username: username,
      password: pass
    }).then(res => {
      localStorage.flowToken = res.data.auth
      localStorage.companyId = res.data.companyId
      localStorage.userInfo = JSON.stringify(res.data.userInfo)
      JsSDK.mountVue()
    })
  }

  static getToken() {
    getToken(this.options.baseUrl,{
      accessKeyId : this.options.accessKeyId,
      accessKeySecret : this.options.accessKeySecret
    }).then(res => {
      localStorage.flowToken = res.data.token
      JsSDK.mountVue()
    })
  }

  static mountVue () {
    const el = this.options.el;
    // vue实例
    const $sdk = new Vue({
      render: (h) => h(main, { 
        props: this.options,
        on: {
          onClose: this.options.onClose ? this.options.onClose : '',
          onSave: this.options.onSave ? this.options.onSave : ''
        } 
      }),
      mounted () {
        this.callback && this.callback();
      }
    }).$mount();
    // 将实例添加到元素上
    document.getElementById(el).appendChild($sdk.$el)
  }

  static render (options, callback) {
    if (!options) {
      throw new Error('配置不可为空')
    }
    if (options.authType === 'login' && (!options.username || !options.password)) {
      throw new Error('授权方式为login时，username与password不能为空')
    } else if (options.authType === 'token' && (!options.accessKeyId || !options.accessKeySecret)) {
      throw new Error('授权方式为token时，accessKeyId与accessKeySecret不能为空')
    }
    if (!options.authType) options.authType = 'default'
    this.options = Object.assign({}, options);
    this.callback = callback
    switch (options.authType) {
      case 'login': JsSDK.onlogin(); break
      case 'token': JsSDK.getToken(); break
      case 'default': JsSDK.mountVue(); break
    }
  }

  static init (options, callback) {
    return new JsSDK(options, callback);
  }
}

export default JsSDK;

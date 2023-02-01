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
    if (this.options.authType === 'login') {
      const username = this.options.username
      const password = this.options.password
      const base64 = new Base64()
      const pass = base64.encode(password)
      login({
        username: username,
        password: pass
      }).then(res => {
        localStorage.token = res.data.auth
        localStorage.companyId = res.data.companyId
        localStorage.userInfo = JSON.stringify(res.data.userInfo)
      })
    }
  }

  static getToken() {
    if (this.options.authType === 'token') {
      getToken({
        accessKeyId : this.options.accessKeyId,
        accessKeySecret : this.options.accessKeySecret
      }).then(res => {
        localStorage.token = res.data.token
      })
    }
  }

  static render (options, callback) {
    // 默认options
    if (options === void 0) {
      options = {
        el: "#app",
        authType: 'default', // login,token,default
        username: '',
        password: '',
        id: '',
        state: '',
        closeBtn: false,
        onClose: ()=>{},
        onSave: ()=>{}
      };
    }
    if (options.authType === 'login' && (!options.username || !options.password)) {
      throw new Error('授权方式为login时，username与password不能为空')
    } else if (options.authType === 'token' && (!options.accessKeyId || !options.accessKeySecret)) {
      throw new Error('授权方式为token时，accessKeyId与accessKeySecret不能为空')
    }
    this.options = Object.assign({}, options);
    options.authType === 'login' && JsSDK.onlogin()
    options.authType === 'token' && JsSDK.getToken()
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
        callback && callback();
      }
    }).$mount();
    // 将实例添加到元素上
    document.getElementById(el).appendChild($sdk.$el)
  }

  static init (options, callback) {
    return new JsSDK(options, callback);
  }
}

export default JsSDK;

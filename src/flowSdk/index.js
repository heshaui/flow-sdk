/* eslint-disable no-unused-vars */
import Vue from "vue";
import './easyFlow/index.css'
import './easyFlow/reset.scss'
import main from "./easyFlow/panel.vue"
import { login, getToken } from '@/api/common'
import Base64 from './easyFlow/base64'
import ElementUI from 'element-ui'
Vue.use(ElementUI);


class JsSDK {
  constructor(options, callback) {
    // if (!JsSDK.instance) {
    //   JsSDK.render(options, callback);
    //   JsSDK.instance = this;
    // }
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
        ivrData: null,
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
    console.log(this.options)
    const el = this.options.el;
    new Vue({
      render: (h) => h(main, { 
        props: this.options,
        on: {
          closeDetailDialog: this.options.onClose ? this.options.onClose : '',
          saveCloseDialog: this.options.onSave ? this.options.onSave : ''
        } 
      }),
      mounted () {
        callback && callback();
      }
    }).$mount(el);
  }

  static init (options, callback) {
    // if (!this.instance) {
    //   this.instance = new JsSDK(options, callback);
    // }
    return new JsSDK(options, callback);
  }
}

export default JsSDK;

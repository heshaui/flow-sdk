/* eslint-disable no-unused-vars */
import Vue from "vue";
import ElementUI from 'element-ui'
import './easyFlow/index.css'
import './easyFlow/reset.scss'
import main from "./easyFlow/panel.vue"
import { login } from '@/api/common'
import Base64 from './easyFlow/base64'
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
    if (this.options.login) {
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

  static render (options, callback) {
    // 默认options
    if (options === void 0) {
      options = {
        el: "#app",
        login: false,
        username: '',
        password: '',
        id: '',
        state: '',
        ivrData: null,
        closeBtn: false,
        closeDetailDialog: ()=>{},
        saveCloseDialog: ()=>{}
      };
    }
    if (options.login && (!options.username || !options.password)) {
      throw new Error('请在配置中输入用户名密码')
    }
    this.options = Object.assign({}, options);
    options.login && JsSDK.onlogin()
    console.log(this.options)
    const el = this.options.el;
    new Vue({
      render: (h) => h(main, { 
        props: this.options,
        on: {
          closeDetailDialog: this.options.closeDetailDialog ? this.options.closeDetailDialog : '',
          saveCloseDialog: this.options.saveCloseDialog ? this.options.saveCloseDialog : ''
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

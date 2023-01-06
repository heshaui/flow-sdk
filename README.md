## weihu-flow-sdk
IVR流程编辑器
### 获取sdk
```
npm install weihu-flow-dk
```
### 引入
```js
import flowSdk from 'flow-sdk'
```
或者
```html
<script src="./flowSdk/flowSdk.umd.min.js"></script>
```
### 快速使用
```js
import flowSdk from 'flow-sdk'

flowSDK.init({
      el: '#flowsdk',         // 挂载的元素，必传
      authType: 'login',    // 获取token的方式，必传
      username: '',  // 用户名，authType为login时必传
      password: '', // 密码，authType为login时必传
	  accessKeyId: '', // authType为token时必传
	  accessKeySecret: '', // authType为token时必传,
	  id: '', // ivr模版id
      state: '', // 流程状态 '':新增；'edit':编辑；'detail':查看
      ivrData: null, // 当前模版数据，用来渲染
      closeBtn: false, // 是否需要返回按钮，
	  onClose: () => {}, // 返回按钮点击事件
	  onSave: () => {} // 最终保存成功的回调函数
 })
```
### 配置项
`flowSDK.init(options)`中的配置项
#### el
`必传`挂载的元素
#### authType
`必传`获取token的方式：login：登录获取；token：accesskey获取；default：已经有token，无需获取
#### username
用户名，authType为login时`必传`
#### password
密码，authType为login时`必传`
#### accessKeyId
authType为token时`必传`
#### accessKeySecret
authType为token时`必传`
#### id
模版id，编辑、查看时`必传`
#### state
`必传`模版状态，新增：''; 编辑：edit；查看：detail
#### ivrData
当前模版数据，编辑、查看时`必传`
#### closeBtn
是否需要返回按钮
#### onClose
`function`返回按钮点击事件函数
#### onSave
`function`最终保存成功的回调函数
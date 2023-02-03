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
      el: 'flowsdk',         // 挂载的元素的id，必传
      baseUrl: '', // 服务的baseUrl，默认是'https://cc.v-call.cn'
      authType: 'login',    // 获取token的方式，必传
      username: '',  // 用户名，authType为login时必传
      password: '', // 密码，authType为login时必传
      accessKeyId: '', // authType为token时必传
      accessKeySecret: '', // authType为token时必传,
      id: '', // ivr模版id
      state: '', // 流程状态 '':新增；'edit':编辑；'detail':查看
      closeBtn: false, // 是否需要返回按钮，默认true
      onClose: () => {}, // 返回按钮点击事件
      onSave: id => {} // 最终保存成功的回调函数,返回ivr的id
 })
```
### 配置项
`flowSDK.init(options)`中的配置项
#### el
`必传`挂载元素的id
#### baseUrl
接口服务的baseUrl，默认'https://cc.v-call.cn'
#### authType
`必传`获取token的方式：login：登录获取；token：accesskey获取；default：已经有token，无需获取
##### default 
`authType`为default时，需先调用'login'服务，并设置localStorage.flowToken
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
#### closeBtn
是否需要返回按钮，默认true
#### onClose
`function`返回按钮点击事件函数
#### onSave
`function`最终保存成功的回调函数，返回创建的ivr模版id

### 可能出现的问题
#### 1、babel-loader未编译node_modules 中的文件
如果使用中报如下错误：
```js
vue-router.esm.js?8c4f:2314 Error: Module parse failed: Unexpected token (1:27676)
```
原因是js中存在es6语法，默认情况下 babel-loader 会忽略所有 node_modules 中的文件
##### 解决方法
以vue项目为例，在`vue.config.js`中配置
```js
 transpileDependencies: ['element-ui', 'weihu-flow-sdk']
```
#### 2、找不到font文件
```js
Error
GET http://localhost:3000/static/js/fonts/element-icons.ff18efd1.woff 404 (Not Found)
GET http://localhost:3000/static/js/fonts/element-icons.f1a45d74.ttf net::ERR_ABORTED 404 (Not Found)
```
##### 解决方法
将weihu-flow-sdk中的font文件夹放到public/static/js下即可
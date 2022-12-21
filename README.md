# flow-sdk

 [TOC]
# 背景介绍
本文主要介绍使用vue、elementUI开发一个流程图的jsSDK包，给第三方的人调用，方便第三方用户集成开发。

# 使用方法
npm i flow-sdk

import flowSdk from 'flow-sdk'
或者直接在html中引入flowSdk.umd.min.js

flowSdk.init({
  el: '#flowSdk', // 要挂载的元素
  login: false, // 是否登录
  username: '', // 用户名
  password: '', // 密码
  id: '', // 流程id
  state: '', // 流程状态  '':新增；'edit':编辑  'detail':查看
  ivrData: null, // 流程数据
  closeBtn: false, // 是否需要返回按钮
  closeDetailDialog: ()=>{}, // 点击返回按钮事件
  saveCloseDialog: ()=>{} // 点击保存事件
})

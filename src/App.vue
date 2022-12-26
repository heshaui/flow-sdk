<template>
  <div id="app">
    <div id="jssdk"></div>
  </div>
</template>

<script>
// import flowSDK from '@/flowSdk/index'
import flowSDK from 'weihu-flow-sdk'
export default {
  name: 'App',
  mounted () {
    flowSDK.init({
      el: '#jssdk',
      authType: 'login',
      username: 'weihu',
      password: '123456',
      closeBtn: false
    })
  }
}
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

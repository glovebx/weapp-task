const config = require('config.js')

const fetch = require('./utils/fetch.js')

/**
 * Baidu API 模块
 * @type {Object}
 */
const baidu = require('./utils/baidu.js')

/**
 * WeChat API 模块
 * @type {Object}
 * 用于将微信官方`API`封装为`Promise`方式
 * > 小程序支持以`CommonJS`规范组织代码结构
 */
const wechat = require('./utils/wechat.js')

App({

  /**
   * Config
   */
  config: config,

  /**
   * Fetch
   */
  fetch: fetch,

  /**
   * Baidu API
   */
  baidu: baidu,

  /**
   * WeChat API
   */
  wechat: wechat,

  onLaunch: function (options) {
    wx.setStorageSync("formid", [])
    wx.setStorageSync("formidTime", [])

    if (Object.keys(options.query).length) {
      wx.setStorageSync('query', options.query)
    }

    let token = wx.getStorageSync('token')
    if (token) {
      this.checkToken(token)
    }    
  },

  checkToken: function (token) {
    const that = this

    fetch(config.URI, '/user/check-token', { token: token })
    .then(res => {
      if (res.data.code != 0) {
        wx.removeStorageSync('token');
        wechat.getSetting()
        .then(res => {
          if (!res.authSetting['scope.userInfo']) {
            // 引导去授权页面
            that.goLoginPageTimeOut();
            // } else {
            //   // 缓存token存在但是失效了，并且用户已经授权，这里直接去登录
            //   // 子页面可能会提前判断缓存token 是否存在
            //   that.goLoginPageTimeOut();
          }
        })
      }
    })

    // wx.request({
    //   url: config.URI + '/user/check-token',
    //   data: {
    //     token: token
    //   },
    //   header: {
    //     "content-type": "json"
    //   },
    //   success: function (res) {
    //     if (res.data.code != 0) {
    //       wx.removeStorageSync('token');
    //       wx.getSetting({
    //         success(res) {
    //           if (!res.authSetting['scope.userInfo']) {
    //             // 引导去授权页面
    //             that.goLoginPageTimeOut();
    //             // } else {
    //             //   // 缓存token存在但是失效了，并且用户已经授权，这里直接去登录
    //             //   // 子页面可能会提前判断缓存token 是否存在
    //             //   that.goLoginPageTimeOut();
    //           }
    //         }
    //       });
    //     }
    //   }
    // });
  },

  goLoginPageTimeOut: function () {
    setTimeout(function () {
      wx.navigateTo({
        url: "/pages/tabBar/tologin/tologin"
      })
    }, 500)
  },

  globalData: {
    currentCityName: null
  }
})
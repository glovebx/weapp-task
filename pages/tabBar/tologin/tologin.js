import bus from '../../../utils/bus.js'
const app = getApp()

Page({
  data: {},
  onLoad: function (query) {
  },

  onReady: function() {},
  onShow: function() {},
  onHide: function() {},
  onUnload: function() {},
  onPullDownRefresh: function() {},
  onReachBottom: function() {},
  
  collectFormId: function (event) {
    let formids = wx.getStorageSync("formid")
    let formidTimes = wx.getStorageSync("formidTime")
    if ("the formId is a mock one" !== event.detail.formId) {
      formids.push(event.detail.formId)
      formidTimes.push(Date.parse(new Date()) / 1000)
    };

    wx.setStorageSync("formid", formids)
    wx.setStorageSync("formidTime", formidTimes)
  },

  login: function () {
    const that = this
    const token = wx.getStorageSync('token')
    if (token) {
      app.fetch(app.config.URI, '/user/check-token', { token: token })
      .then(res => {
        if (res.data.code != 0) {
          wx.removeStorageSync('token')
          that.login()
        } else {
          bus.emit('event', 'logon')
          // 回到原来的地方
          wx.navigateBack()
        }
      })
      // wx.request({
      //   url: rootUrl + '/user/check-token',
      //   data: {
      //     token: token
      //   },
      //   header: {
      //     "Content-Type": "json"
      //   },
      //   success: function (res) {
      //     if (res.data.code != 0) {
      //       wx.removeStorageSync('token')
      //       that.login();
      //     } else {
      //       // 回到原来的地方
      //       wx.navigateBack();
      //     }
      //   }
      // })
      return
    }

    app.wechat.login()
    .then(res => {
      app.fetch(app.config.URI, '/user/wxapp/login', { code: res.code })
        .then(res => {
          // console.log(res);
          if (res.data.code == 10000) {
            // 去注册
            that.registerUser()
            return
          }
          if (res.data.code != 0) {
            // 登录错误
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: '无法登录，请重试',
              showCancel: false
            })
            return
          }
          wx.setStorageSync('token', res.data.token)
          wx.setStorageSync('uid', res.data.uid)
          bus.emit('event', 'logon')
          // 回到原来的地方
          wx.navigateBack()
        })
    })
    // wx.login({
    //   success: function (res) {
    //     wx.request({
    //       url: rootUrl + '/user/wxapp/login',
    //       data: {
    //         code: res.code
    //       },
    //       header: {
    //         "Content-Type": "json"
    //       },
    //       success: function (res) {
    //         // console.log(res);
    //         if (res.data.code == 10000) {
    //           // 去注册
    //           that.registerUser();
    //           return;
    //         }
    //         if (res.data.code != 0) {
    //           // 登录错误
    //           wx.hideLoading();
    //           wx.showModal({
    //             title: '提示',
    //             content: '无法登录，请重试',
    //             showCancel: false
    //           })
    //           return;
    //         }
    //         wx.setStorageSync('token', res.data.token);
    //         wx.setStorageSync('uid', res.data.uid);
    //         // 回到原来的地方
    //         wx.navigateBack();
    //       }
    //     })
    //   }
    // })
  },

  registerUser: function () {
    const that = this
    
    app.wechat.login()
      .then(res => {
        const code = res.code // 微信登录接口返回的 code 参数，下面注册接口需要用到
        app.wechat.getUserInfo()
        .then(res => {
          const iv = res.iv
          const encryptedData = res.encryptedData

          let shareUid = ''
          let transUid = ''
          // 如果有query
          let query = wx.getStorageSync('query')
          if (query) {
            if (query.scene) {
              const params = decodeURIComponent(query.scene).split('-')
              shareUid = params[0] || ''
              transUid = params[1] || ''
            } else {
              shareUid = query.shareUid || ''
              transUid = query.transUid || ''
            }
          }
          // 下面开始调用注册接口
          app.fetch(app.config.URI, '/user/wxapp/register/complex'
            , { 
              code: code
              , encrypted_data: encryptedData
              , iv: iv
              , share_uid: shareUid
              , trans_uid: transUid})
              .then(res => {
                wx.hideLoading()
                wx.setStorage({
                  key: 'new_user',
                  data: parseInt(Date.parse(new Date())),
                })
                that.login()
              })
          // 下面开始调用注册接口
          // wx.request({
          //   url: rootUrl + '/user/wxapp/register/complex',
          //   data: {
          //     code: code,
          //     encrypted_data: encryptedData,
          //     iv: iv,
          //     share_uid: shareUid,
          //     trans_uid: transUid
          //   }, // 设置请求的 参数
          //   header: {
          //     "Content-Type": "json"
          //   },
          //   success: (res) => {
          //     wx.hideLoading();
          //     wx.setStorage({
          //       key: 'new_user',
          //       data: parseInt(Date.parse(new Date())),
          //     });
          //     that.login();
          //   }
          // })
        })
      })

    // wx.login({
    //   success: function (res) {
    //     var code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
    //     wx.getUserInfo({
    //       success: function (res) {
    //         var iv = res.iv;
    //         var encryptedData = res.encryptedData;
            
    //         var shareUid = '';
    //         var transUid = '';
    //         // 如果有query
    //         var query = wx.getStorageSync('query');
    //         if (query) {
    //           if (query.scene) {
    //             const params = decodeURIComponent(query.scene).split('-');
    //             shareUid = params[0] || '';
    //             transUid = params[1] || '';
    //           } else {
    //             shareUid = query.shareUid || '';
    //             transUid = query.transUid || '';
    //           }
    //         }
    //         // 下面开始调用注册接口
    //         wx.request({
    //           url: rootUrl + '/user/wxapp/register/complex',
    //           data: {
    //             code: code,
    //             encrypted_data: encryptedData,
    //             iv: iv,
    //             share_uid: shareUid,
    //             trans_uid: transUid
    //           }, // 设置请求的 参数
    //           header: {
    //             "Content-Type": "json"
    //           },
    //           success: (res) => {
    //             wx.hideLoading();
    //             wx.setStorage({
    //               key: 'new_user',
    //               data: parseInt(Date.parse(new Date())),
    //             });
    //             that.login();
    //           }
    //         })
    //       }
    //     })
    //   }
    // })
  },

  bindGetUserInfo: function (event) {
    if (!event.detail.userInfo) {
      return
    }
    // wx.setStorageSync('userInfo', event.detail.userInfo)
    // app.globalData.userInfo = event.detail.userInfo
    this.login()
  },

})
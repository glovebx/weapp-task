import bus from '../../../utils/bus.js'
const app = getApp()

Page({
  data: {
    cityName: '正在定位...',
    tabIndex: 0, //默认选择‘正在热映’
    states: ['open', 'standby'],

    //‘正在热映’数据
    taskList0: [],
    taskList1: [],
    //‘即将上映’数据
    mostExpectedList: [],

    page0: 1,
    page1: 1,
    hasMoreData0: true, //‘正在上映’数据是否加载到最后一条    
    hasMoreData1: true, // 即将开始

    startLoadMore0: false,
    startLoadMore1: false,

    loadCompleted2: false //水平滚动加载的数据是否加载完毕
  },

  onLoad() {
    this.eventId = bus.on('event', (key) => {
      console.log('event', key)
      if (key === 'logon') {
        this.loadData()
      } else if (key === 'locate') {
        // 重新定位
        this.initPage()
      }
    })

    this.initPage()
    this.loadData()
  },

  initPage() {
    // //https://www.jianshu.com/p/aaf65625fc9d   解释的很好
    // if (app.globalData.userLocation) {
    //   this.setData({
    //     cityName: app.globalData.selectCity ? app.globalData.selectCity.cityName : '定位失败'
    //   })
    // } else {
    //   app.userLocationReadyCallback = () => {
    //     this.setData({
    //       cityName: app.globalData.selectCity ? app.globalData.selectCity.cityName : '定位失败'
    //     })
    //   }
    // }
    const that = this
    app.wechat
      .getLocation()
      .then(res => {
        const { latitude, longitude } = res
        return app.baidu.getCityName(latitude, longitude)
      })
      .then(name => {
        // this.data.currentCity = name.replace('市', '')
        that.setData({
          cityName: name.replace('市', '')
        })
        app.globalData.currentCityName = name.replace('市', '')
        console.log(`currentCity : ${name}`)
      })
      .catch(err => {
        // this.data.currentCity = '北京'
        that.setData({
          cityName: '定位失败'
        })
        console.error(err)
      })
  },

  onShow() {
    const selectCity = app.globalData.selectCity
    if (selectCity && selectCity.cityName != this.data.cityName) {
      this.setData({
        cityName: selectCity.cityName
      })
    }
  },

  // // 下拉刷新
  // onPullDownRefresh() {
  //   this.loadData()
  //   setTimeout(function () {
  //     wx.stopPullDownRefresh()
  //   }, 1000)
  // },

  //上拉触底刷新
  onReachBottom() {
    // // 会从this.data给左边名字相同的变量赋值
    // const {
    //   tabIndex,
    //   taskList0,
    //   // movieIds0,
    //   taskList1,
    //   // movieIds1,
    //   loadComplete0,
    //   loadComplete1
    // } = this.data
    const tabIndex = this.data.tabIndex
    const hasMoreData = this.data[`hasMoreData${tabIndex}`]
    if (!hasMoreData) {
      return
    }

    this.loadMore(tabIndex)

    // if (this.data.tabIndex === 0) {
    //   this.loadMore(taskList0, 0)
    // } else {
    //   this.loadMore(taskList1, 1)
    // }
  },

  //第一次加载页面时请求‘正在热映的数据’
  loadData() {
    wx.showLoading({
      title: '正在加载...'
    })

    const tabIndex = this.data.tabIndex
    this.setData({
      [`page${tabIndex}`]: 1,
    })

    const that = this
    const data = {
      token: wx.getStorageSync('token') || '',
      state: this.data.states[tabIndex], 
      page: 1
    }
    app.fetch(app.config.URI, '/task/list', data)
    .then(res => {
      console.log(res)
      wx.hideLoading()
      if (res.data.code != 0) {
        // error
        return
      }

      that.setData({
        [`taskList${tabIndex}`]: res.data.data,
        [`hasMoreData${tabIndex}`]: res.data.hasMore,
      })

    })
    .catch(res => {
      wx.hideLoading()
    });

    // wx.request({
    //   url: 'https://m.maoyan.com/ajax/movieOnInfoList?token=',
    //   success(res) {
    //     const taskList0 = that.formatImgUrl(res.data.taskList)
    //     wx.hideLoading()
    //     that.setData({
    //       movieIds0: res.data.movieIds,
    //       taskList0
    //     })
    //     if (res.data.taskList.length >= res.data.movieIds.length) {
    //       that.setData({
    //         // 表示所有的数据都已经获取完成！
    //         loadComplete0: true
    //       })
    //     }
    //   }
    // })
  },

  goLoginPageTimeOut: function () {
    setTimeout(function () {
      wx.navigateTo({
        url: "../tologin/tologin"
      })
    }, 1000)
  },  

  openTask(event) {
    const token = wx.getStorageSync('token')
    if (!token) {
      // goto login page
      this.goLoginPageTimeOut()
      return
    }
    
    const that = this
    wx.showLoading({
      title: '正在领取...'
    })

    const data = {
      token: token, 
      task_id: event.currentTarget.dataset.task_id
    }
    app.fetch(app.config.URI, '/task/start', data, 'POST', {
          "content-type": "application/x-www-form-urlencoded"
        })
      .then(res => {
        console.log(res)
        wx.hideLoading()
        if (res.data.code != 0) {
          // error
          return
        }

        const taskId = res.data.data.task_id
        const taskList = that.data.taskList0
        for (var i in taskList) {
          if (taskList[i].taskId == taskId) {
            taskList[i].state = res.data.data.state
            taskList[i].myState = res.data.data.myState
            break
          }
        }

        that.setData({
          taskList0: taskList
        })
      })
      .catch(res => {
        wx.hideLoading()
      })
  },

  //切换swtch
  switchTab(event) {
    const tabIndex = event.currentTarget.dataset.tabIndex
    this.setData({
      tabIndex: tabIndex
    })

    if (tabIndex === 1 && !this.data.mostExpectedList.length) {
      wx.showLoading({
        title: '正在加载...'
      })
      const that = this

      app.fetch(app.config.URI, '/task/list'
        , { state: this.data.states[1], priority: 1, limit: 10})
        .then(res => {
          console.log(res)
          // wx.hideLoading()
          if (res.data.code != 0) {
            // error
            return
          }

          that.setData({
            mostExpectedList: res.data.data
          })

        })
        .catch(res => {
          // wx.hideLoading()
        })

      app.fetch(app.config.URI, '/task/list'
        , { state: this.data.states[1], page: this.data.page1})
        .then(res => {
          console.log(res)
          wx.hideLoading()
          if (res.data.code != 0) {
            // error
            return
          }

          that.setData({
            taskList1: res.data.data,
            hasMoreData1: res.data.hasMore
          })

        })
        .catch(res => {
          wx.hideLoading()
        })

      // wx.request({
      //   url: 'https://m.maoyan.com/ajax/mostExpected?limit=10&offset=0&token=',
      //   success(res) {
      //     wx.hideLoading()
      //     that.setData({
      //       mostExpectedList: that.formatImgUrl(res.data.coming, true)
      //     })
      //   }
      // })
      // wx.request({
      //   url: 'https://m.maoyan.com/ajax/comingList?token=&limit=10',
      //   success(res) {
      //     wx.hideLoading()
      //     that.setData({
      //       movieIds1: res.data.movieIds,
      //       taskList1: that.formatImgUrl(res.data.coming)
      //     })
      //   }
      // })
    }
  },

  //上拉触底刷新的加载函数
  loadMore(tabIndex) {

    const taskList = this.data[`taskList${tabIndex}`]
    const page = this.data[`page${tabIndex}`] + 1
    this.setData({
      [`page${tabIndex}`]: page,
      [`startLoadMore${tabIndex}`]: true,
    })

    const that = this

    app.fetch(app.config.URI, '/task/list'
      , { state: this.data.states[tabIndex], page: page })
      .then(res => {
        console.log(res)
        // wx.hideLoading()
        
        if (res.data.code != 0) {
          // error
          this.setData({
            [`startLoadMore${tabIndex}`]: false
          })
          return
        }

        that.setData({
          [`taskList${tabIndex}`]: list.concat(res.data.data),
          [`hasMoreData${tabIndex}`]: res.data.hasMore,
          [`startLoadMore${tabIndex}`]: false
        })

      })
      .catch(res => {
        // wx.hideLoading()
        this.setData({
          [`startLoadMore${tabIndex}`]: false
        })        
      })    
    // const length = list.length
    // if (length + 10 >= ids.length) {
    //   this.setData({
    //     [`loadComplete${tabIndex}`]: true
    //   })
    // }
    // let query = ids.slice(length, length + 10).join('%2C')
    // const url = `https://m.maoyan.com/ajax/moreComingList?token=&movieIds=${query}`
    // wx.request({
    //   url,
    //   success(res) {
    //     const arr = list.concat(that.formatImgUrl(res.data.coming))
    //     that.setData({
    //       [`taskList${item}`]: arr,
    //     })
    //   }
    // })
  },

  //滚动到最右边时的事件处理函数
  onScrollToLower() {
    const {
      mostExpectedList,
      loadComplete2
    } = this.data
    const length = mostExpectedList.length
    const that = this
    if (loadComplete2) {
      return
    }
    wx.request({
      url: `https://m.maoyan.com/ajax/mostExpected?limit=10&offset=${length}&token=`,
      success(res) {
        that.setData({
          mostExpectedList: mostExpectedList.concat(that.formatImgUrl(res.data.coming, true)),
          loadComplete2: !res.data.paging.hasMore || !res.data.coming.length //当返回的数组长度为0时也认为数据请求完毕
        })
      }
    })
  },

  // //处理图片url
  // formatImgUrl(arr, cutTitle = false) {
  //   //小程序不能在{{}}调用函数，所以我们只能在获取API的数据时处理，而不能在wx:for的每一项中处理
  //   if (!Array.isArray(arr)) {
  //     return
  //   }
  //   let newArr = []
  //   arr.forEach(item => {
  //     let title = item.comingTitle
  //     if (cutTitle) {
  //       title = item.comingTitle.split(' ')[0]
  //     }
  //     let imgUrl = item.img.replace('w.h', '128.180')
  //     newArr.push({ ...item,
  //       comingTitle: title,
  //       img: imgUrl
  //     })
  //   })
  //   return newArr
  // },

  //转发
  onShareAppMessage(res) {
    return {
      title: '快来看看附近的电影院',
      path: 'pages/tabBar/movie/movie'
    }
  },

  onUnload() {
    bus.remove('event', this.eventId)
  }
})
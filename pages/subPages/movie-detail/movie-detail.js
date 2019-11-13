const app = getApp()
const util = require('../../../utils/util.js')

Page({

  data:{
    detailTask: null,    //电影详情
    isDescFold: false,
    comments: {}   //观众评论
  },

  onLoad(options){
    const taskId = options.taskId
    this.loadData(taskId)
  },

  //初始页面
  loadData(taskId) {
    wx.showLoading({
      title: '加载中...',
    })

    const that = this    
    const data = {
      token: wx.getStorageSync('token') || '',
      task_id: taskId
    }
    app.fetch(app.config.URI, '/task/detail', data)
      .then(res => {
        console.log(res)
        wx.hideLoading()
        if (res.data.code != 0) {
          // error
          return
        }

        that.setData({
          detailTask: res.data.data,
        })
        // 获取评论
        that.getComment(taskId)
      })
      .catch(res => {
        wx.hideLoading()
      })
    // wx.request({
    //   url: `https://m.maoyan.com/ajax/detailTask?taskId=${taskId}`,
    //   success(res) {
    //     wx.hideLoading()
    //     that.setData({
    //       detailTask: that.handleData(res.data.detailTask)
    //     })
    //   }
    // })
  },

  //获取观众评论
  getComment(taskId){
    const that = this
    const data = {
      token: wx.getStorageSync('token') || '',
      task_id: taskId
    }
    app.fetch(app.config.URI, '/task/comment/list', data)
      .then(res => {
        console.log(res)
        wx.hideLoading()
        if (res.data.code != 0) {
          // error
          return
        }

        that.setData({
          comments: res.data.data,
        })
      })
      .catch(res => {
        wx.hideLoading()
      })    
    // const that = this
    // wx.request({
    //   url: `https://m.maoyan.com/mmdb/comments/movie/${taskId}.json?_v_=yes&offset=0`,
    //   success(res){
    //     let comments = {...res.data}
    //     if (comments.total){
    //       const arr = comments.hcmts.length ? comments.hcmts : comments.cmts
    //       comments.hcmts = that.formatData(arr.slice(0, 3))
    //     }
    //     that.setData({
    //       comments
    //     })
    //   }
    // })
  },

  // //处理数据
  // formatData(arr) {
  //   let list = []
  //   if (arr.length) {
  //     list = arr.map(item => {
  //       let temp = { ...item }
  //       temp.avatarurl = temp.avatarurl || '/assets/images/avatar.png'
  //       temp.purchase = !!(temp.tagList && temp.tagList.fixed.some(item => item.id === 4))
  //       temp.stars = this.formatStar(temp.score)
  //       temp.calcTime = util.calcTime(temp.startTime)
  //       return temp
  //     })
  //   }
  //   return list
  // },

  //预览图片
  previewImage(e){
    const currentIndex = e.currentTarget.dataset.index
    const urls = this.data.detailTask.images.map(item => item = item.url)
    wx.previewImage({
      urls,
      current: urls[currentIndex]
    })
  },

  // //处理评分星星
  // formatStar(sc){
  //   //1分对应满星，0.5对应半星
  //   let stars = new Array(5).fill('star-empty')
  //   const fullStars = Math.floor(sc)  //满星的个数
  //   const halfStar = sc % 1 ? 'star-half' : 'star-empty' //半星的个数，半星最多1个
  //   stars.fill('star-full', 0, fullStars)              //填充满星
  //   if (fullStars < 5) {
  //     stars[fullStars] = halfStar;           //填充半星
  //   }
  //   return stars
  // },

  // //处理数据
  // handleData(data){
  //   //小程序的{{}}中不能调用函数，只能在这里处理数据
  //   let obj = data
  //   obj.img = obj.img.replace('w.h','177.249')
  //   //将类似“v3d imax”转化为['3D','IMAX']
  //   obj.version = obj.version && obj.version.split(' ').map(item=>{
  //     return item.toUpperCase().replace('V','')
  //   })
  //   //将评分人数单位由个转化为万
  //   obj.snum = obj.snum/10000
  //   obj.snum = obj.snum.toFixed(1)
  //   //评分星星,满分10分，一颗满星代表2分
  //   obj.stars = this.formatStar(obj.sc/2)
  //   //处理媒体库的图片
  //   obj.photos = obj.photos.map(item => item.replace('w.h/', '') +'@180w_140h_1e_1c.webp')
  //   return obj
  // },

  //折叠与展开剧情简介
  toggleDescFold(){
    this.setData({
      isDescFold:!this.data.isDescFold
    })
  },

  //跳转到video页面
  toVideo(){
    const detailTask = this.data.detailTask;
    const paramsStr = JSON.stringify({
      video:{
        videourl: detailTask.videourl,
        videoImg: detailTask.videoImg,
        videoName: detailTask.videoName,
      },
      movieName: detailTask.nm,  //电影名称
      id: detailTask.id,//电影ID
      version: detailTask.version, //电影类型（3d、IMAX）
      release: detailTask.pubDesc, //上映时间
      rt: detailTask.rt,//电影上映时间
      wish: detailTask.wish, //想看的人数
      globalReleased: detailTask.globalReleased, //是否上映
      sc: detailTask.sc, //评分
      showst: detailTask.showst//判读“想看”、“预售”
    })
    wx.navigateTo({
      url: `../video-page/video-page?paramsStr=${paramsStr}`
    })
  }

})
Page({
  data: {
    token: null,
  },

  onLoad() {
  },

  goLogin() {

  },

  onShareAppMessage(res) {
    return {
      title:'埋头做任务，闷声发大财',
      path:'pages/tabBar/task/task'
    }
  }
})
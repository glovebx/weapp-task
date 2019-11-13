/**
 * 抓取远端API的结构
 * 默认 content-type 为 json，如需要覆盖则注意 content-type 大小写必须完全一致
 * @param  {String} api    api 根地址
 * @param  {String} path   请求路径
 * @param  {Objece} params 参数
 * @param  {String} method 方法，GET 或者 POST
 * @param  {Objece} headers 头部参数
 * @return {Promise}       包含抓取任务的Promise
 */
module.exports = function (api, path, params, method, headers) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${api}${path}`,
      method: method || 'GET',
      data: Object.assign({}, params),
      header: Object.assign({ 'content-type': 'json' }, headers),
      success: resolve,
      fail: reject
    })
  })
}

// pages/allBalls/index.js
const app = getApp();

Page({
  data: {
    static: app.globalData.static,
    lists: []
  },

  //跳转到预约中心, 选择运动项目
  toReserveCenter: function (e) {
    var name = e.currentTarget.dataset.catename;
    var id = e.currentTarget.dataset.id

    wx: wx.navigateTo({
      url: '/pages/reserveCenter/index?rsortid=1&catename=' + name + '&cateid=' + id
    })
  },

  onLoad: function (options) {
    var that = this
    wx.request({
      url: app.globalData.https + 'Index/getCatesLists',
      method: 'post',
      header: { 'content-type' : 'application/x-www-form-urlencoded' },
      success:function(res){
        if(res.data.code == 1){
          that.setData({
            lists: res.data.data
          })
        }
      }
    })
  },

  onShow: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})
// pages/makeQR/index.js
const app = getApp()
Page({
  data: {
    orderLists: [],
    store: {},
    flag: true
  },

  // 确认核销
  confirm:function(){
    var data = {
      token: app.globalData.token,
      order_id: this.data.store.order_id
    }
    this.pageInfo('Approve/verificationRorder', data)
  },

  // 请求页面数据
  pageInfo: function (request,data) {
    var that = this
    wx.request({
      url: app.globalData.https + request,
      method: 'post',
      data: data,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        var data = res.data.data
        if (res.data.code == 1) {
          if ( data.lists ){
            that.setData({
              orderLists: data.lists,
              store: data.store
            })
          }else if( data.arr == '' ){
            that.setData({
              flag: false
            })
            wx.showToast({
              title: '核销成功！',
            })
          }
        }else if(res.data.code == 0){
          wx.navigateBack()
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  onLoad: function (options) {
    var data = {
      token: app.globalData.token,
      code: options.code
    }
    this.pageInfo('Approve/scanQr',data)
  },

  onShow: function () {

  },

  onHide: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})
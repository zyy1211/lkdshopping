// pages/QRcode/index.js
const app = getApp()
Page({
  data: {
    left: '',
    mid:'',
    right: '',
    base64ImgUrl: ''
  },

  pageInfo: function (order_id){
    var that = this
    wx.request({
      url: app.globalData.https + 'Approve/makeQr',
      header:{ 'content-type' : 'application/x-www-form-urlencoded' },
      method: 'post',
      data: {
        token: app.globalData.token,
        order_id: order_id
      },
      success:function(res){
        var data = res.data.data
        if(res.data.code == 1){
          var base64ImgUrl = "data:image/png;base64," + wx.arrayBufferToBase64(wx.base64ToArrayBuffer(data.imageString))
          that.setData({
            left: data.code.substring(0,4),
            mid: data.code.substring(4,8),
            right: data.code.substring(8,12),
            base64ImgUrl: base64ImgUrl
          })
        } else if(res.data.code == 0){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000,
            success(){
              setTimeout(function(){
                wx.navigateBack()
              },2000)
            }
          })
        }
      },
    })
  },

  onLoad: function (options) {
    var order_id = options.order_id
    this.pageInfo(order_id)
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
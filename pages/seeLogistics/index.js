// pages/seeLogistics/index.js
const app = getApp()
Page({
  data: {
    modalHidden: true,
    hasData: true,
    order_no: '',
    order_id: '',
    express_company: '',
    lists: []
  },

  // 点击模态框确定按钮
  confirm:function(){
    this.setData({
      modalHidden: true
    })
    this.pageRequest()
  },

  pageRequest:function(){
    var that = this
    wx.showLoading({
      title: '正在加载...',
    })
    wx.request({
      url: app.globalData.https + 'MyOrder/getExpress',
      method: 'post',
      data: {
        token: app.globalData.token,
        order_id: that.data.order_id
      },
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res){
        wx.hideLoading()
        if(res.data.code == 1){
          that.setData({
            lists: res.data.data
          })
          if(res.data.data.length == 0){
            that.setData({
              hasData: false
            })
          }
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      },
      fail(){
        wx.hideLoading()
        that.setData({
          modalHidden: false
        })
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      order_id: options.order_id,
      express_company: options.express_company,
      order_no: options.order_no
    })
    
  },

  onShow: function () {
    this.pageRequest()
  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  }
})
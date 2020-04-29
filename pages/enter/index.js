// pages/enter/index.js
Page({
  data: {
    coach: '',
    store: ''
  },

  // 入驻成为商家
  toBecomeBusinesses:function(){
    wx.navigateTo({
      url: '/pages/becomeBusinesses/index'
    })
  },

  // 入驻成为教练
  toBecomeCoach:function(){
    wx.navigateTo({
      url: '/pages/becomeCoach/index'
    })
  },

  onLoad: function (options) {
    this.setData({
      coach: options.coach,
      store: options.store
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
// pages/reserveClass/index.js
const app = getApp();

Page({
  data: {
    static: app.globalData.static,
    isShow: true,
    pagenum: 1,
    loadMore: true,
    reserveLists: []
  },

  // 跳转到报名详情
  toEnrollDetail:function(e){
    var signup_id = e.currentTarget.dataset.signup_id
    wx.navigateTo({
      url: '/pages/enrollDetail/index?signup_id=' + signup_id
    })
  },

  orderState: function () {
    var that = this
    wx.request({
      url: app.globalData.https + 'Active/mySignup',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        p: that.data.pagenum
      },
      success: function (res) {
        if (res.data.code == 1 && res.data.data != '') {
          var arr1 = that.data.reserveLists;
          var arr2 = res.data.data;
          var arr3 = arr1.concat(arr2);
          that.setData({
            reserveLists: arr3,
            isShow: true
          })
        } else {
          that.setData({
            loadMore: false
          })
        }
        if (that.data.reserveLists == '') {
          that.setData({
            isShow: false
          })
        }
      },
      fail: function () {
        wx.navigateBack()
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  onLoad: function (options) {
    this.orderState()
  },

  onShow: function () {

  },

  onPullDownRefresh: function () {
    this.setData({
      reserveLists: [],
      pagenum: 1
    })
    this.orderState()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    var pagenum = this.data.pagenum + 1; 
    this.setData({
      pagenum: pagenum
    })
    if (this.data.loadMore) {
      this.orderState() 
    } else {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }
  }
})
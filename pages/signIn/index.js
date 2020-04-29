const app = getApp()

Page({
  data: {
    lists: {},
    isflag: false
  },

  // 弹出提示框
  toast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none'
    })
  },

  // 立即签到
  btn: function () {
    var that = this
    var data = {
      signup_id: that.data.lists.signup_id,
      token: app.globalData.token,
      aid: that.data.lists.aid
    }
    that.request('Active/setSign', data, res => {
      if (res.data.code == 1) {
        that.setData({
          isflag: true
        })
      }
      that.toast(res.data.msg)
    })
  },

  request:function(url,data,success){
    wx.request({
      url: app.globalData.https + url,
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: data,
      success: function (res) {
        success(res)
      }
    })
  },

  onLoad: function (options) {
    var that = this
    var data = {
      token: app.globalData.token,
      signup_id: options.signup_id,
      code: options.result,
      type: '0'
    }
    that.request('Active/scanSigninPage',data,res => {
      if (res.data.code == 1) {
        that.setData({
          lists: res.data.data.lists
        })
      }else{
        wx.navigateBack()
        that.toast(res.data.msg)
      }
    })
  },

  onShow: function () {

  },

  onHide: function () {

  }
})
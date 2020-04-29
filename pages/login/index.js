// pages/login/index.js
const app=getApp()
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    avatarUrl:'/images/avator.png',
    userName:''
  },

  onLoad: function (options) {
    var that = this;
    // 查看是否授权，授权了则自动登录
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            lang:'zh_CN',
            success: function (res) {
              //从数据库获取用户信息
              that.login(app.globalData)
            }
          });
        }
      }
    })
  },

  //登录
  login: function (e){
    var that=this
    wx.login({
      success: function (res) {
        if (res.code) {
          wx.request({
            url: app.globalData.https + 'Login/login',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              code: res.code,
              user_info: JSON.stringify(e.userInfo),
              encrypted_data: e.encryptedData,
              iv: e.iv,
              signature: e.signature
            },
            success: res => {
              if (res.data.code === 1) {
                that.setData({
                  avatarUrl: res.data.data.userinfo.avatarurl,
                })
                app.globalData.token = res.data.data.token
                app.globalData.userInfo = res.data.data.userinfo
                wx.showToast({
                  title: '登录成功！',
                })
                wx.navigateBack()
              }
            }
          })
        }
      }
    })
  },

  //授权
  bindGetUserInfo:function(e) {
    //用户按了允许授权按钮
    if (e.detail.userInfo) {
      this.login(e.detail)
    }
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
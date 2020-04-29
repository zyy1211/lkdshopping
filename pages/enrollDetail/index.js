// pages/myEnroll/index.js
const paySuccess = require('../../utils/util.js');
const app = getApp()
Page({
  data: {
    active: {},
    enrollessLists:[],
    signup: {},
    signup_id: ''
  },

  // 现场签到
  signIn:function(){
    var qiandao = this.data.signup.qiandao
    if (qiandao == '2'){
      this.toast('请先支付费用')
      return
    }
    wx.scanCode({
      success: (res) => {
        wx.navigateTo({
          url: '/pages/signIn/index?result=' + res.result + '&signup_id=' + this.data.signup_id
        })
      }
    })
  },

  // 弹出提示框
  toast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none'
    })
  },

  // 修改参赛人员信息
  updateData:function(){
    var timeState = this.data.active.expire_data
    if (timeState == '1'){
      wx.navigateTo({
        url: '/pages/modifyInfo/index?signup_id=' + this.data.signup_id
      })
    }else{
      this.toast('报名已结束，无法修改！')
    }
  },

  //微信支付
  wxPay: function (payment) {
    var that = this
    wx.requestPayment({
      timeStamp: payment.timeStamp,
      nonceStr: payment.nonceStr,
      package: 'prepay_id=' + payment.prepay_id,
      signType: 'MD5',
      paySign: payment.paySign,
      success(res) {
        wx.showToast({
          title: '报名成功！'
        })
        paySuccess.paySuccess(app.globalData.https + 'Pushs/getFormID', 'post', { token: app.globalData.token, formid: payment.prepay_id, type: 0 })
        that.infoData()
      },
      fail() {
        that.toast('费用未支付')
      }
    })
  },

  // 去支付
  topay:function(){
    var that = this
    var status = that.data.signup.pay_status
    var signup_id = that.data.signup.signup_id
    if(status != '10'){
      return
    }
    wx.request({
      url: app.globalData.https + 'Active/fromSignuptoPay',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        signup_id: signup_id
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.wxPay(res.data.data.payment)
        } else {
          that.toast(res.data.msg)
        }
      }
    })
  },

  // 页面信息接口
  infoData:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'Active/mySignupDetail',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        signup_id: that.data.signup_id
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            enrollessLists: res.data.data.palyers,
            active: res.data.data.active,
            signup: res.data.data.signup
          })
        } else {
          that.toast(res.data.msg)
        }
      },
      fail: function () {
        that.toast('网络错误')
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      signup_id: options.signup_id
    })
  },

  onShow: function () {
    var token = app.globalData.token
    if (token == '') {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    this.infoData()
  }
})
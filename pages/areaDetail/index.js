const paySuccess = require('../../utils/util.js');
const app = getApp()
Page({
  data: {
    min: '',
    sec: '',
    isOpen: true,
    order_id: '',
    orderLists:[],
    order: {}
  },

  // 去评价
  toPj:function(){
    var order = this.data.order
    var data = {
      uid: order.uid,
      order_id: order.order_id,
      hostid: order.res_id
    }
    wx.navigateTo({
      url: '/pages/reserveEvaluation/index?data=' + JSON.stringify(data),
    })
  },

  // 去核销
  toUse:function(){
    wx.navigateTo({
      url: '/pages/QRcode/index?order_id=' + this.data.order_id,
    })
  },

  // 取消订单
  cancel:function(){
    var that = this
    wx.showModal({
      title: '友情提示',
      content: '确定取消该订单吗？',
      success:function(res){
        if(res.confirm){
          that.pageInfo('Reservations/cancel')
          wx.navigateBack({
            delta: 2
          })
        }else{
          return
        }
      }
    })
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
        that.pageInfo('Reservations/getRorderDetail')
        paySuccess.paySuccess(app.globalData.https + 'Pushs/getFormID', 'post', { token: app.globalData.token, formid: payment.prepay_id, type: 0 })
      },
      fail() {
        wx.showToast({
          title: '订单未支付',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },

  // 立即支付
  pay: function () {
    var that = this
    that.pageInfo('Reservations/fromRordertoPay')
  },

  // 收起/展开
  open: function(){
    this.setData({
      isOpen: !this.data.isOpen
    })
  },

  // 请求页面数据
  pageInfo: function (httpRequest){
    var that = this
    wx.showLoading({
      title: '数据请求中',
    })
    wx.request({
      url: app.globalData.https + httpRequest,
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        order_id: that.data.order_id
      },
      success: function (res){
        console.log(res);
        wx.hideLoading()
        var data = res.data.data
        if (res.data.code == 1) {
          if(data.order){
            that.setData({
              orderLists: data.lists,
              order: data.order
            })
            if (data.order.status.value == 1){
              that.countDown()
            } 
          }
          if (httpRequest == 'Reservations/cancel'){
            wx.showToast({
              title: res.data.msg,
            })
          }
          if (data.payment){
            that.wxPay(data.payment)
          }
        } else if(res.data.code == 0){
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '网络错误',
          icon:'none',
          duration: 2000,
          success:function(){
            wx.navigateBack()
          }
        })
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      order_id: options.order_id
    })
  },

  // 倒计时
  countDown: function (){
    var that = this
    var countdown = that.data.order.countdown
    var timer = setInterval(function () {
      if (countdown >= 0){
        var min = Math.floor(countdown / 60 % 60)
        var sec = Math.floor(countdown % 60)
        that.setData({
          min: min,
          sec: sec
        })
        countdown: --countdown
      }else{
        clearInterval(timer);
        that.pageInfo('Reservations/getRorderDetail')      
      }
    }, 1000)
  },

  onShow: function () {
    var token = app.globalData.token
    if(token == ''){
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    this.pageInfo('Reservations/getRorderDetail')
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
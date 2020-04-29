const paySuccess = require('../../utils/util.js');
const app=getApp()

Page({
  data: {
    address:{},
    goods:[],
    order:{},
    order_id:'',
    static: app.globalData.static
  },

  // 查看物流
  toSeeLogistics: function () {
    var order_id = this.data.order.order_id
    var order_no = this.data.order.order_no
    var express_company = this.data.express_company
    wx.navigateTo({
      url: '/pages/seeLogistics/index?order_id=' + order_id + '&express_company=' + express_company + '&order_no=' + order_no
    })
  },

  // 删除订单
  deleOrder: function () {
    var order_id = this.data.order_id
    wx.showModal({
      title: '删除订单',
      content: '确定删除该订单吗？',
      success: function (result) {
        if (result.confirm) {
          wx.request({
            url: app.globalData.https + 'MyOrder/deleteOrder',
            method: 'post',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
              token: app.globalData.token,
              order_id: order_id
            },
            success: function (res) {
              if (res.data.code == 1) {
                wx.showToast({
                  title: res.data.msg
                })
                setTimeout(function(){
                  wx.navigateBack()
                },1500)
              } else {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none'
                })
              }
            }
          })
        }
      }
    })
  },

  // 确认收货
  received: function (e) {
    var that = this
    var order_id = that.data.order.order_id
    wx.request({
      url: app.globalData.https + 'MyOrder/setReceipt',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        order_id: order_id
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.orderDetail()
          wx.showToast({
            title: res.data.msg
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  //去评价
  toCommodityEvaluation: function (e) {
    var goods = e.currentTarget.dataset.goods
    var uid = this.data.order.uid
    var order_id = this.data.order_id
    wx.navigateTo({
      url: '/pages/commodityEvaluation/index?goods=' + JSON.stringify(goods) + '&uid=' + uid + '&order_id=' + order_id
    })
  },

  //微信支付
  wxPay: function (payment, order_id) {
    var that = this
    wx.requestPayment({
      timeStamp: payment.timeStamp,
      nonceStr: payment.nonceStr,
      package: 'prepay_id=' + payment.prepay_id,
      signType: 'MD5',
      paySign: payment.paySign,
      success(res) {
        paySuccess.paySuccess(app.globalData.https + 'Pushs/getFormID', 'post', { token: app.globalData.token, formid: payment.prepay_id, type: 0 })
      },
      fail() {
        wx.showToast({
          title: '订单未支付',
          icon: 'none'
        })
      },
      complete:function(){
        that.orderDetail()
      }
    })
  },

  // 去付款
  toPay:function(){
    var that=this
    var order = that.data.order
    wx.request({
      url: app.globalData.https + 'Order/fromOrdertoPay',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        order_no: order.order_no,
        pay_price: order.pay_price,
        order_id: that.data.order_id
      },
      success: function (res) {
        var data = res.data.data
        if (res.data.code == 1) {
          that.setData({
            payment: data.payment,
            order_id: data.order_id
          })
          that.wxPay(data.payment)
        }
      }
    })
  },

  // 去兑换
  toExchange:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'Order/fromOrdertoExchange',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        pay_price: that.data.order.pay_price,
        order_id: that.data.order_id
      },
      success: function (res){
        if (res.data.code == 1) {
          if(res.data.data.result == 1){
            wx.showToast({
              title: '兑换成功'
            })
            that.orderDetail()
          }else{
            wx.showToast({
              title: '积分不足',
              icon: 'none'
            })
          }
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  //取消订单
  cancleOrder:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'MyOrder/cancel',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        order_id: that.data.order_id
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.orderDetail()
        }
        wx.showToast({
          title: res.data.msg
        })
      }
    })
  },

  //请求订单详情
  orderDetail:function(){
    var that=this
    wx.request({
      url: app.globalData.https + 'MyOrder/detail',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        order_id: that.data.order_id
      },
      success: function (res) {
        var data = res.data.data
        if( res.data.code == 1 ) {
          that.setData({
            goods: data.goods,
            address: data.address,
            order: data.order
          })
        } else if (res.data.code == 0){
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      },
      fail:function(err){
        wx.showModal({
          title: '网络错误',
          content: '请检查网络连接',
          showCancel: false
        })
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      order_id: options.order_id
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
    this.orderDetail()
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
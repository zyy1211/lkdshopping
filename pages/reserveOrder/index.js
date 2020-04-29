const paySuccess = require('../../utils/util.js');
const app = getApp()
Page({
  data: {
    arr:{},
    orderLists:[],
    drawMenu: true,
    userInfo:{},
    isCheck: false,
    order_id: '',
    res_id:'',
    isClick: false
  },

  //微信支付
  wxPay: function (order_id,payment) {
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
      fail(res) {
        wx.showToast({
          title: '订单未支付',
          icon: 'none',
          duration: 1000
        })
      },
      complete(){
        wx.redirectTo({
          url: '/pages/areaDetail/index?order_id=' + order_id
        })
      }
    })
  },

  // 立即支付
  toPay:function(){
    this.setData({
      isClick: true
    })
    this.pageInfo('post', this.data.isCheck )
  },

  // 积分抵扣
  switchChange:function(e){
    this.setData({
      isCheck: e.detail.value
    })
  },

  // 打开/收起预约列表
  drawMenu:function(){
    this.setData({
      drawMenu: !this.data.drawMenu
    })
  },

  // 跳转到场地订单详情
  toAreaDetail:function(){
    wx.navigateTo({
      url: '/pages/areaDetail/index',
    })
  },

  // 请求页面信息
  pageInfo:function(method,isPoints){
    var that = this
    var rsortid = that.data.userInfo.rsortid
    wx.request({
      url: app.globalData.https + 'Reservations/makeOrder',
      method: method,
      header: { 'content-type' : 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        uid: that.data.userInfo.uid,
        rsortid: rsortid,
        str: that.data.userInfo.str,
        isPoints: isPoints,
        res_id: that.data.userInfo.res_id,
        coach_id: that.data.userInfo.coach_id
      },
      success:function(res){
        console.log(res);
        if( res.data.code == 1 ){
          if (res.data.data.arr ){
            that.setData({
              arr: res.data.data.arr,
              orderLists: res.data.data.lists,
              isCheck: res.data.data.arr.isPoints
            })
          }
          if( res.data.data.payment ){
            that.wxPay(res.data.data.order_id,res.data.data.payment)
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

  onLoad: function (options) {
    this.setData({
      ['userInfo.uid']: options.uid,
      ['userInfo.rsortid']: options.rsortid,
      ['userInfo.res_id']: options.res_id,
      ['userInfo.str']: options.str
    })
    if (options.coach_id){
      this.setData({
        ['userInfo.coach_id']: options.coach_id
      })
    }
    this.pageInfo('get', 'true') 
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
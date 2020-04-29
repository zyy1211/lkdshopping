const paySuccess = require('../../utils/util.js');
const app=getApp()
Page({
  data: {
    currIndex:0,
    static: app.globalData.static,
    tab: ['全部订单','待付款', '待发货', '待收货','待评价'],
    orderState: ['all', 'payment', 'delivery', 'received','comment'],
    proLists:[],
    pagenum: 1, //初始页默认值为1
    loadMore: true,
    isShow: true,
    payment:'',
    order_id: '',
    isReceived: false
  },

  // 查看物流
  toSeeLogistics:function(e){
    var order_no = e.currentTarget.dataset.order_no
    var order_id = e.currentTarget.dataset.order_id
    var express_company = e.currentTarget.dataset.express_company
    wx.navigateTo({
      url: '/pages/seeLogistics/index?order_id=' + order_id + '&order_no=' + order_no + '&express_company=' + express_company
    })
  },

  // 删除订单
  deleOrder:function(e){
    var that = this
    var proLists = that.data.proLists
    var order_id = e.currentTarget.dataset.order_id
    var i = e.currentTarget.dataset.index
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
                proLists.splice(i,1)
                that.setData({
                  proLists
                })
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
        }
      }
    })
  },

  // 确认收货
  received:function(e){
    var that = this
    var order_id = e.currentTarget.dataset.order_id
    wx.request({
      url: app.globalData.https + 'MyOrder/setReceipt',
      method: 'post',
      header: { 'content-type' : 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        order_id: order_id
      },
      success: function(res){
        wx.redirectTo({
          url: '/pages/orderDeatil/index?order_id=' + order_id
        })
        if(res.data.code == 1){
          wx.showToast({
            title: res.data.msg
          })
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  // 去兑换
  exchange: function (e) {
    var order = e.currentTarget.dataset.order
    var that = this
    wx.request({
      url: app.globalData.https + 'Order/fromOrdertoExchange',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        pay_price: order.pay_price,
        order_id: order.order_id
      },
      success: function (res) {
        if (res.data.code == 1) {
          if (res.data.data.result == 1) {
            wx.redirectTo({
              url: '/pages/orderDeatil/index?order_id=' + order.order_id
            })
            wx.showToast({
              title: '兑换成功'
            })
          } else {
            wx.showToast({
              title: '积分不足',
              icon: 'none'
            })
          }
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  //付款
  pay:function(e){
    var that=this
    var orderPay = e.currentTarget.dataset.order
    wx.request({
      url: app.globalData.https + 'Order/fromOrdertoPay',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        order_no: orderPay.order_no,
        order_id: orderPay.order_id,
        pay_price: orderPay.pay_price
      },
      success: function (res) {
        var data=res.data.data
        if (res.data.code == 1 ) {
          that.setData({
            payment: data.payment
          })
          that.wxPay(data.payment, data.order_id)
        }
      }
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
        wx.redirectTo({
          url: '/pages/orderDeatil/index?order_id=' + order_id
        })
      },
      fail() {
        wx.showToast({
          title: '订单未支付',
          icon: 'none',
          success() {
            setTimeout(function () {
              wx.redirectTo({
                url: '/pages/orderDeatil/index?order_id=' + order_id
              })
            }, 1000)
          }
        })
      }
    })
  },

  //取消订单
  cancleOrder: function (e) {
    var that = this
    var order_id=e.currentTarget.dataset.order_id
    wx.showModal({
      title: '友情提示',
      content: '确定取消该订单吗？',
      success:function(res){
        if(res.confirm){
          wx.request({
            url: app.globalData.https + 'MyOrder/cancel',
            method: 'post',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
              token: app.globalData.token,
              order_id: order_id
            },
            success: function (res) {
              if (res.data.code == 1) {  
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none'
                })
                that.setData({
                  proLists: [],
                  pagenum: 1
                })
                that.orderState()
              }
            }
          })
        }
      }
    })
  },

  //切换订单选项卡
  tap:function(e){
    var index = e.currentTarget.dataset.index;
    this.setData({
      currIndex: index
    })
    this.orderTap()
  },

  //切换订单选项卡，调用接口
  orderTap:function(){
    var that = this;
    var index = that.data.currIndex
    var orderState = that.data.orderState
    that.setData({
      proLists: [],
      pagenum: 1
    })
    that.orderState()  
  },

  //跳转到订单详情
  toOrderDetail:function(e){
    var order_id=e.currentTarget.dataset.order_id
    wx.navigateTo({
      url: '/pages/orderDeatil/index?order_id=' + order_id
    })
  },

  //根据订单状态发送请求
  orderState:function(){
    var that=this
    var index= that.data.currIndex
    var orderState = that.data.orderState
    wx.request({
      url: app.globalData.https + 'MyOrder/lists',
      method:'post',
      header:{ 'content-type' : 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        p: that.data.pagenum,       //  从数据里获取当前页数
        dataType: orderState[index]
      },
      success: function(res){
        if (res.data.code == 1 && res.data.data != ''){
          var arr1 = that.data.proLists;
          var arr2 = res.data.data;
          var arr3 = arr1.concat(arr2);
          that.setData({
            proLists: arr3,
            isShow: true
          })
        } else {
          that.setData({
            loadMore: false
          })
        }
        if (that.data.proLists == '') {
          that.setData({
            isShow: false
          })
        }
      },
      fail:function(){
        wx.showModal({
          title: '友情提示',
          content: '网络错误，请返回重进',
          showCancel: false
        })
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      currIndex:options.index
    })
  },

  onShow: function () {
    this.setData({
      proLists: [],
      pagenum: 1
    })
    this.orderState()
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    var index = this.data.currIndex
    this.setData({
      proLists: [],
      pagenum: 1
    })
    this.orderState()
    wx.stopPullDownRefresh()
  },

  //上拉加载
  onReachBottom: function () {
    var pagenum = this.data.pagenum + 1;       //获取当前页数并+1
    this.setData({
      pagenum: pagenum,                        //更新当前页数
    })
    if (this.data.loadMore) {
      this.orderState()                    //重新调用请求获取下一页数据
    } else {
      wx.showToast({
        title: '没有更多数据了',
      })
    }
  },

  onHide: function () {

  },

  onShareAppMessage: function () {

  }
})
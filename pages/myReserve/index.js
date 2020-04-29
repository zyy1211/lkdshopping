const paySuccess = require('../../utils/util.js');
const app = getApp()
Page({
  data: {
    static: app.globalData.static,
    cate: '全部',         // 分类下拉默认显示第一个
    state: '',  
    cateIndex: 0,       // 分类的请求参数 rsortid
    stateIndex: '',    // 状态的请求参数 status
    tabState: [],
    tabCate: [],
    pagenum: 1,  
    isDrawCate: false,
    isDrawState: false,
    loadMore: true,
    isShow: true,
    reserveLists:[]
  },

  // 跳转到预约详情
  toDetail:function(e){
    var res_id = e.currentTarget.dataset.res_id    
    var rsortid = e.currentTarget.dataset.rsortid
    if (rsortid == '3') {
      wx.navigateTo({
        url: '/pages/coach/index?id=' + res_id,
      })
    } else {
      wx.navigateTo({
        url: '/pages/reserveDetail/index?id=' + res_id,
      })
    }
  },

  // 跳转到预约详情
  toAreaDetail:function(e){
    var order_id = e.currentTarget.dataset.order_id
    wx.navigateTo({
      url: '/pages/areaDetail/index?order_id=' + order_id,
    })
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
        wx.navigateTo({
          url: '/pages/areaDetail/index?order_id=' + order_id,
        })
        
      },
      fail() {
        wx.showToast({
          title: '订单未支付',
          icon: 'none',
          duration: 1000,
          success(){
            wx.navigateTo({
              url: '/pages/areaDetail/index?order_id=' + order_id,
            })
          }
        })
      }
    })
  },

  // 立即支付
  pay: function (e) {
    var that = this
    var order_id = e.currentTarget.dataset.order_id
    wx.request({
      url: app.globalData.https + 'Reservations/fromRordertoPay',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        order_id: order_id
      },
      success: function (res) {
        var data = res.data.data
        if (res.data.code == 1) {
          that.wxPay(data.order_id, data.payment)
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          that.orderState()
        }
      }
    })
  },

  //下拉类别
  drawCate: function () {
    this.setData({
      isDrawCate: !this.data.isDrawCate,
      isDrawState: false
    })
  },

  //下拉状态
  drawState: function () {
    this.setData({
      isDrawCate: false,
      isDrawState: !this.data.isDrawCate
    })
  },

  // 切换类别
  tapCate:function(e){
    var index = e.currentTarget.dataset.index
    var cate = this.data.tabCate[index].text
    var cateIndex = this.data.tabCate[index].value
    this.setData({
      isDrawCate: false,
      cate: cate,
      cateIndex: cateIndex,
      reserveLists: [],
      pagenum: 1
    })
    this.orderState()
  },

  // 切换状态
  tapState:function(e){
    var index = e.currentTarget.dataset.index
    var state = this.data.tabState[index].text
    var stateIndex = this.data.tabState[index].value
    this.setData({
      state: state,
      isDrawState: false,
      stateIndex: stateIndex,
      reserveLists: [],
      pagenum: 1
    })
    this.orderState()
  },

  //根据订单状态发送请求
  orderState: function () {
    var that = this
    wx.request({
      url: app.globalData.https + 'Reservations/getRorderLists',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        rsortid: that.data.cateIndex,       
        status: that.data.stateIndex,
        p: that.data.pagenum                          //  从数据里获取当前页数
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
        wx.showModal({
          title: '友情提示',
          content: '网络错误，请返回重进',
          showCancel: false
        })
      }
    })
  },

  // 头部下拉请求
  navDrawMenu:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'Reservations/getRorderChooseLists',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data:{ token: app.globalData.token },
      success:function(res){
        var data = res.data.data
        if( res.data.code == 1 ){
          that.setData({
            tabCate: data.rsortid,
            tabState: data.status
          })
        }
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      state: options.text,
      stateIndex: options.stateIndex
    },() => {
      this.navDrawMenu()
      this.orderState()
    })
  },

  onShow: function () {

  },

  onHide: function () {

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
    var pagenum = this.data.pagenum + 1;       //获取当前页数并+1
    this.setData({
      pagenum: pagenum,                        //更新当前页数
    })
    if (this.data.loadMore) {
      this.orderState()                    //重新调用请求获取下一页数据
    } else {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }
  },

  onShareAppMessage: function () {

  }
})
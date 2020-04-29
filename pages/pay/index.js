const paySuccess = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    type: '',
    static: app.globalData.static,
    address:{},
    flag:true,
    isShowText:true,
    express_price: '0',
    order_type:'',
    proLists:[],
    errorMsg:'',
    has_error: false,
    exist_address:true,
    payPri:'0',
    totalPri:'0',
    order_total_num: 0,
    remark: '',        //用于存储textarea输入内容
    isHidePlaceholder: false,
    goods_ids: '',      //从购物车页面进来
    goodsInfo: {},       //从详情页面进来
    payment:{},
    order_id: '' ,         // 订单号
    isBan: false,          //禁止二次点击
    result: ''
  },

  //输入文本，同步到文本框
  clickTextArea:function(e){
    var val = e.detail.value;
    this.setData({
      isShowText: true,
      remark: val
    })
    if(val == ''){
      this.setData({
        isHidePlaceholder: false
      })
    }else{
      this.setData({
        isHidePlaceholder: true
      })
    }
  },

  //点击显示富文本框，隐藏文本框
  clickText:function(){
    this.setData({
      isShowText: false
    })
  },

  //去选择地址
  toAddress:function(){
    var exit=this.data.exist_address
    if(exit){
      wx.navigateTo({
        url: '/pages/deliveryAddress/index',
      })  
    }else{
      wx.navigateTo({
        url: '/pages/addAddress/index?address_id=' + '',
      })
    }
  },

  //提示模态框
  showModal:function(){
    var that=this
    wx.showModal({
      title: '友情提示',
      content: that.data.errorMsg,
      showCancel: false
    })
  },

  //微信支付
  wxPay: function(){
    var that=this
    var payment = that.data.payment
    wx.requestPayment({
      timeStamp: payment.timeStamp,
      nonceStr: payment.nonceStr,
      package: 'prepay_id=' + payment.prepay_id,
      signType: 'MD5',
      paySign: payment.paySign,
      success(res) {
        paySuccess.paySuccess(app.globalData.https + 'Pushs/getFormID', 'post', { token: app.globalData.token, formid: payment.prepay_id, type: 0})
      },
      fail() {
        wx.showToast({
          title: '订单未支付',
          icon: 'none'
        })
      },
      complete() {
        wx.redirectTo({
          url: '/pages/orderDeatil/index?order_id=' + that.data.order_id
        })
      }
    })
  },

  //提交订单
  submitOrder: function(){
    var that=this
    var exit = that.data.exist_address
    if(that.data.has_error){
      that.showModal()
      return
    }
    that.setData({
      isBan: true
    })
    if ( !exit ){
      that.showModal()
      return
    }
    that.proInfoHandle('post')
    setTimeout(function(){
      if(that.data.type == '1'){
        wx.redirectTo({
          url: '/pages/orderDeatil/index?order_id=' + that.data.order_id
        })
        wx.showToast({
          title: '兑换成功'
        })
        if(that.data.result == '2'){
          wx.showToast({
            title: '积分不足',
            icon: 'none'
          })
        }
      }else{
        that.wxPay()
      }
    },1500)
  },

  //获取商品信息
  proInfoHandle:function(parmas){
    var that=this
    var order_type=that.data.order_type
    var requestParmas=''
    var data=''
    var methods=''
    if(order_type == '0'){
      requestParmas = 'Order/cart'
      data={
        token: app.globalData.token,
        goods_ids: that.data.goods_ids
      }
    } else if (order_type == '1'){
      requestParmas = 'Order/buyNow'
      data = {
        token: app.globalData.token,
        goods_id: that.data.goodsInfo.goods_id,
        goods_num: that.data.goodsInfo.goods_num,
        goods_sku_id: that.data.goodsInfo.goods_sku_id,
        msg: that.data.remark
      }
    }
    if (parmas) {
      methods = 'POST'
    } else {
      methods = 'GET'
    }
    wx.request({
      url: app.globalData.https + requestParmas,
      method: methods,
      data: data,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success:function(res){
        var data=res.data.data
        if( res.data.code == 1 ){
          if (data.order_total_num){
            that.setData({
              totalPri: data.order_total_price,
              payPri: data.order_pay_price,
              express_price: data.express_price,
              order_total_num: data.order_total_num,
              errorMsg: data.error_msg,
              proLists: data.goods_list,
              has_error: data.has_error,
              type: data.type
            })
          }
          if (!data.exist_address){
            that.setData({
              flag: false,
              exist_address: false,
              address: data.address
            })
          }else{
            that.setData({
              flag: true,
              exist_address: true,
              address: {
                name: data.address.name,
                phone: data.address.phone,
                city_name: data.address.city_name,
                detail: data.address.detail,
                province_name: data.address.province_name,
                region_name: data.address.region_name
              }
            })
          }
          if(data.payment){
            that.setData({
              payment: data.payment,
              order_id: data.order_id
            })
          }
          if (data.has_error) {
            that.showModal()
          }
          if(that.data.type == '1' && data.result ){
            that.setData({
              result: data.result,
              order_id: data.order_id
            })
          }
        }else if(res.data.code == 0){
          that.setData({
            flag: true
          })
          wx:wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        } else if (res.data.code == -1) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
  },

  onLoad: function (options) {
    if (options.order_type == '0'){
      this.setData({
        order_type: options.order_type,
        goods_ids: options.goods_ids
      })
    } else if (options.order_type == '1'){
      this.setData({
        order_type: options.order_type,
        goodsInfo: JSON.parse(options.goodsInfo)
      })
    }
  },

  onShow: function () {
    this.proInfoHandle();
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
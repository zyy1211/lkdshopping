const app=getApp();
const phoneNumber = require('../../utils/util.js');
Page({
  data: {
    telModialog: false,
    isRequest: true,        // ture 需要请求，false不需要
    isshare: 0,     // 0, 表示不是从分享进入, 1 表示是从分享进入
    id: '',          // 即 res_id
    static:app.globalData.static,
    title:'',
    info:{},          // 进入页面数据
    currIndex:1,
    imgUrls: [],
    slider:[],
    options:[],
    idx: 0,
    rsortid: '',
    isModialog: false,
    wIndex: 0,
    class_id: '',
    class_date: '',
    isFlag: false
  },

  // 关闭获取电话号码模态框
  closeTelModia: function () {
    this.setData({
      telModialog: false
    })
  },

  // 登录检测
  login: function () {
    var token = app.globalData.token
    if (token == '') {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    var isRequest = this.data.isRequest
    if (isRequest) {
      this.setData({
        isModialog: false
      })
      this.requestPhone()
      return
    }
  },

  // 调用微信手机号 API
  getPhone: function (e) {
    var data = {
      token: app.globalData.token,
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv
    }
    var that = this
    phoneNumber.getPhoneNumber(data, res => {   // 回调拿到返回值
      if (res == 'success') {
        that.setData({
          telModialog: false
        })
      } else if (res == 'fail') {
        that.setData({
          telModialog: true
        })
      }
    })
  },

  // 请求手机号是否绑定
  requestPhone: function () {
    var that = this
    var telModialog = that.data.telModialog
    phoneNumber.bindPhone({ token: app.globalData.token }, res => {
      if (res.phone != '') {
        that.setData({
          telModialog: false,
          isRequest: false
        })
      } else {
        that.setData({
          telModialog: true,
        })
      }
    })
  },

  // 生成海报
  createPoster: function () {
    this.setData({
      isFlag: !this.data.isFlag
    })
    this.selectComponent('#getPoster').getAvaterInfo();
  },

  // 切换遮罩层
  tapmMask: function () {
    this.setData({
      isFlag: !this.data.isFlag
    })
  },

  // 跳转到商家详情
  toBusinessesDetail:function(e){
    wx.navigateTo({
      url: '/pages/businessesDetail/index?store_id=' + e.currentTarget.dataset.store_id
    })
  },

  //关闭模态框
  closeModialog: function () {
    this.setData({
      isModialog: !this.data.isModialog
    })
  },

  // 模态框中的预约按钮
  reserveBtn:function(){
    var rsortid = this.data.rsortid
    this.createOrder('post')
  },

  // 创建订单接口,调用 makeOrder 接口
  createOrder: function (method){
    var that = this
    var rsortid = that.data.rsortid
    var res_id = that.data.id
    var uid = that.data.info.uid
    var class_id = that.data.class_id
    var str = that.data.title + ',' + that.data.class_date + ',0' + ',' + class_id
    wx.request({
      url: app.globalData.https + 'Reservations/makeOrder',
      method: method,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        uid: uid,
        rsortid: rsortid,
        str: str,
        res_id: res_id
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            isModialog: !that.data.isModialog
          })
          if (method == 'post'){
            wx.navigateTo({
              url: '/pages/areaDetail/index?order_id=' + res.data.data.order_id
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

  // 弹出模态框
  modialog:function(e){
    this.login()
    var isRequest = this.data.isRequest
    if (isRequest) {
      this.setData({
        isModialog: false
      })
      return
    }
    this.setData({
      class_id: e.currentTarget.dataset.class_id,
      class_date: e.currentTarget.dataset.class_date
    })
    this.createOrder('get')       // get 方式调用
  },

  // 课程预约
  toReseveOrder:function(e){
    this.login()
    var isRequest = this.data.isRequest
    if (isRequest) {
      return
    }
    var i = e.currentTarget.dataset.index
    var uid = this.data.info.uid
    var rsortid = this.data.rsortid
    var res_id = this.data.id
    var title = this.data.title
    var class_date = this.data.info.classres[i].class_date
    var class_id = this.data.info.classres[i].class_id
    var price = this.data.info.classres[i].money
    var str = title + ',' + class_date + ',' + price + ',' + class_id
    wx.navigateTo({
      url: '/pages/reserveOrder/index?uid=' + uid + '&rsortid=' + rsortid + '&str=' + str + '&res_id=' + res_id,
    })
  },

  // 选择运动球类
  sportsOptions:function(e){
    var idx = e.currentTarget.dataset.idx
    this.setData({ idx: idx })
  },

  //显示当前轮播图的索引值
  currentIndex:function(e){
    if( e.detail.source == 'touch' ){
      this.setData({
        currIndex: e.detail.current+1
      })
    }
  },

  //点击预览轮播图图片
  previewImage:function(e){
    var index = e.currentTarget.dataset.index;
    var imgList=this.data.imgUrls
    var arr = []
    for (var i = 0, len = imgList.length; i < len; i++) {
      var list = this.data.static + imgList[i].save_path + imgList[i].file_name
      arr.push(list)
    }
    wx.previewImage({
      current: arr[index],      // 当前显示图片的http链接
      urls: arr,         // 需要预览的图片http链接列表
    })
  },

  // 时间段选择
  selectChange:function(e){
    var idx = this.data.idx
    var type = this.data.options[idx]
    var index = e.currentTarget.dataset.index
    var week = e.currentTarget.dataset.week
    var uid = this.data.info.uid
    var rsortid = this.data.rsortid
    wx.navigateTo({
      url: '/pages/timeSelect/index?type=' + type + '&res_id=' + this.data.id + '&index=' + index + '&week=' + week + '&uid=' + uid + '&rsortid=' + rsortid
    })
  },

  // 调用地图
  getLocation:function(){
    var latitude = this.data.info.lat;
    var longitude = this.data.info.lon;
    wx.openLocation({
      latitude: Number(latitude),
      longitude: Number(longitude),
      name: this.data.title,
      address: this.data.info.raddr
    })
  },

  //拨打电话
  callTel:function(){
    var tel = this.data.info.rtel
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },

  onLoad: function (options) {
    var that = this
    if (options.isshare == 1) {
      that.setData({
        isshare: options.isshare
      })
    }
    that.setData({
      id: options.id
    })
    wx.request({
      url: app.globalData.https + 'Reservations/resContent',
      method:'POST',
      header:{
        'content-type':'application/x-www-form-urlencoded'
      },
      data:{
        res_id: that.data.id          
      },
      success:function(res){
        var data=res.data.data
        if(res.data.code == 1){
          that.setData({
            info: data,
            slider: data.weeks,
            options: data.type,
            rsortid: data.rsortid,
            imgUrls: data.imgs,
            title: data.title
          })
        }
      },
      fail:function(){
        wx.showModal({
          title: '友情提示',
          content: '网络错误',
          showCancel: false,
          success: function (res) {
            wx.navigateBack()
          }
        })
      }
    })
  },

  onShow: function () {
   
  },

  // 回到首页(分享的时候)
  backHome: function () {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },

  onShareAppMessage: function () {
    var img = this.data.info.share.img
    var id = this.data.id
    var title = this.data.title
    return {
      title: title,
      path: '/pages/reserveDetail/index?isshare=1&id=' + id + '&title=' + title,
      imageUrl: img
    }
  }
})
// pages/coach/index.js
const  app = getApp()
const phoneNumber = require('../../utils/util.js');
Page({
  data: {
    telModialog: false,
    isRequest: true,        // ture 需要请求，false不需要
    res_id: '',
    pagedata: {},   // 页面数据
    static: app.globalData.static,
    slider: [],
    timeLists: [],
    wIndex: 0,
    isModialog: false,
    timesId: null,
    isTimeValue: '',
    coachInfo: {}       // 教练信息
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
          telModialog: true
        })
      }
    })
  },

  // 跳转到预约详情
  toBusinessesDetail: function () {
    this.login()
    var res_id = this.data.coachInfo.res.id
    var title = this.data.coachInfo.res.title
    wx.navigateTo({
      url: '/pages/reserveDetail/index?id=' + res_id + '&title=' + title
    })
  },

  // 关注/取消关注
  attention:function(){
    var that = this
    that.login()
    var isFollow = that.data.coachInfo.isFollow
    var uid = that.data.pagedata.uid
    wx.request({
      url: app.globalData.https + 'Videos/setAttention',
      method: 'post',
      header:{ 'content-type' : 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        uid: uid
      },
      success:function(res){
        if(res.data.code == 1){
          that.setData({
            ['coachInfo.isFollow']: !isFollow
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

  // 调用地图
  getLocation: function () {
    var latitude = this.data.pagedata.lat;
    var longitude = this.data.pagedata.lon;
    wx.openLocation({
      latitude: Number(latitude),
      longitude: Number(longitude),
      name: this.data.pagedata.title,
      address: this.data.pagedata.raddr
    })
  },

  // 切换星期请求接口
  weekRequest: function () {
    var that = this
    var weeks = that.data.slider
    var i = that.data.wIndex
    var res_id = that.data.res_id
    wx.request({
      url: app.globalData.https + 'Reservations/getCoachTimes',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        res_id: res_id,
        week: weeks[i].week_value
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            timeLists: res.data.data
          })
        }
      }
    })
  },

  // 模态框中的预约按钮,跳转到订单确认页面
  reserveBtn: function () {
    this.login()
    var rsortid = this.data.pagedata.rsortid
    var isTimeValue = this.data.isTimeValue
    if (isTimeValue == '') {
      wx.showToast({
        title: '请选择上课时间',
        icon: 'none'
      })
      return
    }
    var res_id = this.data.res_id
    var uid = this.data.pagedata.uid
    var price = this.data.pagedata.price
    var coach_id = this.data.coachInfo.coach_id
    var weeks = this.data.slider
    var i = this.data.wIndex
    var title = this.data.coachInfo.nickname
    var str = title + ',' + weeks[i].year + ',' + weeks[i].date + ',' + isTimeValue + ',' + weeks[i].week + ',' + price
    wx.navigateTo({
      url: '/pages/reserveOrder/index?uid=' + uid + '&rsortid=' + rsortid + '&str=' + str + '&res_id=' + res_id + '&coach_id=' + coach_id
    })
    this.setData({                        // 关闭模态框
      isModialog: !this.data.isModialog,
      timesId: null,
      isTimeValue: ''
    })
  },

  // 选择上课时间
  selectedTime: function (e) {
    this.setData({
      isTimeValue: e.currentTarget.dataset.times,
      timesId: e.currentTarget.dataset.id
    })
  },

  // 日期切换
  tapDate: function (e) {
    this.setData({
      wIndex: e.currentTarget.dataset.index,
      timesId: null,
      isTimeValue: ''
    })
    this.weekRequest()
  },

  //关闭模态框
  closeModialog: function () {
    this.setData({
      isModialog: !this.data.isModialog
    })
  },

  // 弹出模态框
  modialog: function () {
    this.login()
    var isRequest = this.data.isRequest
    if (isRequest) {
      return
    }
    var rsortid = this.data.rsortid
    this.setData({
      isModialog: !this.data.isModialog
    })
    this.weekRequest()
  },

  onLoad: function (options) {
    var that = this
    that.setData({
      res_id: options.id
    })
    wx.request({
      url: app.globalData.https + 'Reservations/resContent',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        res_id: that.data.res_id
      },
      success: function (res) {
        var data = res.data.data
        if (res.data.code == 1) {
          that.setData({
            coachInfo: data.coach,
            slider: data.weeks,
            pagedata: data
          })
        }
      },
      fail: function () {
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

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})
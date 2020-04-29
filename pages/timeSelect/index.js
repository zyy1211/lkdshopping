const app = getApp()
const phoneNumber = require('../../utils/util.js');
Page({
  data: {
    telModialog: false,
    isRequest: true,        // ture 需要请求，false不需要
    time: [],
    currentTab: 0, //tab切换
    hour: [
      "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
    ],
    session: [],
    reLists: [],
    type: '',
    res_id: '',
    week: '',
    year: '',
    uid: '',
    rsortid: ''
  },

  // 关闭获取电话号码模态框
  closeTelModia: function () {
    this.setData({
      telModialog: false
    })
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

  //选择场次
  isClick: function (e) {
    var that = this
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
    var idx = e.currentTarget.dataset.idx
    var idy = e.currentTarget.dataset.idy
    var hc = e.currentTarget.dataset.x
    var price = e.currentTarget.dataset.y
    var year = e.currentTarget.dataset.year
    var id = e.currentTarget.dataset.id
    var flag = that.data.session[idx].lists[idy].isChoose
    var a = 'session[' + idx + '].lists[' + idy + '].isChoose'
    var reLists = that.data.reLists
    var hour = that.data.hour
    var list = {
      hc: hc,
      pre: hour[idy],
      next: hour[idy + 1],
      id: id,
      year: year,
      price: price,
      index: idy
    }
    if (flag) {
      if (reLists.length >= 8) {
        wx: wx.showToast({
          title: '最多选择8个',
          icon: 'none'
        })
        return false
      }
      that.setData({
        reLists: reLists.concat(list),
        [a]: !flag
      })
    } else {
      for (var i in reLists) {
        if (id == reLists[i].id) {
          reLists.splice(i, 1)
        }
      }
      that.setData({
        reLists: that.data.reLists,
        [a]: !flag
      })
    }
  },

  // 验证是否为连续自然数
  arrange(source) {
    var t;
    var ta;
    var r = [];
    source.forEach(function (v) {
      if (t === v) {
        ta.push(t);
        t++;
        return;
      }
      ta = [v];
      t = v + 1;
      r.push(ta);     // r 里面只有一个数组则为连续的场次
    });
    return r;
  },

  // 确定，提交
  submit: function () {
    var that = this
    var reLists = this.data.reLists
    var idx = that.data.currentTab
    if (reLists == '') {
      wx.showToast({
        title: '请选择时间段',
        icon: 'none'
      })
      return
    }
    var indexs = [];
    for (var i in reLists) {
      indexs.push(reLists[i].index);
    }
    var hash = [];            // 数组去重
    for (var i = 0; i < indexs.length; i++) {
      if (hash.indexOf(indexs[i]) == -1) {
        hash.push(indexs[i]);
      }
    }
    hash.sort( (a, b) => (a - b) );          // 排序
    var s = that.arrange(hash);
    if (s.length == 1) {
      var str = ''
      for (var i = 0, len = reLists.length; i < len; i++) {
        str = str + reLists[i].year + ',' + that.data.time[idx].date + ',' + that.data.time[idx].week + ',' + reLists[i].hc + ',' +
          reLists[i].pre + '-' + reLists[i].next + ',' + that.data.type + ',' + reLists[i].price + '$'
      }
      str = str.substring(0, str.length - 1)        //  去掉最后一个 $
      var uid = that.data.uid
      var rsortid = that.data.rsortid
      var res_id = that.data.res_id
      wx.navigateTo({
        url: '/pages/reserveOrder/index?uid=' + uid + '&rsortid=' + rsortid + '&str=' + str + '&res_id=' + res_id,
      })
    } else {
      wx.showToast({
        title: '请选择连续场次',
        icon: 'none'
      })
    }
  },

  // tap时间切换
  Tap: function (e) {
    let index = e.currentTarget.dataset.idx
    let week = e.currentTarget.dataset.week
    this.setData({
      currentTab: index,
      week: week,
      reLists: []
    })
    this.navBody()
  },

  // 头部星期，中间场次接口请求
  navBody: function () {
    var that = this
    wx.showLoading({
      title: '数据请求中',
    })
    wx.request({
      url: app.globalData.https + 'Reservations/getSession',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        res_id: that.data.res_id,
        week: that.data.week,
        type: that.data.type
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.code == 1) {
          that.setData({
            time: res.data.data.weeks,
            session: res.data.data.data
          })
        }
      },
      fail: function(){
        wx.hideLoading()
        wx.showModal({
          title: '网络错误',
          content: '数据请求失败',
          showCancel: false,
          success:function(res){
            if(res.confirm){
              wx.navigateBack()
            }
          }
        })
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      type: options.type,
      res_id: options.res_id,
      currentTab: options.index,
      week: options.week,
      uid: options.uid,
      rsortid: options.rsortid
    })
  },

  onShow: function () {
    this.setData({
      reLists: []
    })
    this.navBody()
  }
})
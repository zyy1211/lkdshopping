// pages/my/index.js
const app=getApp();

Page({
  data: {
    idx: 4,
    avatarUrl:'/images/avator.png',
    userName: '请点击登录',
    shouC:0,
    message:0,
    yuE:'0.00',
    jiFen:0,
    isCoach: '',
    isStore: '',
    list:[
      {'src':'/images/shouhuo.png','txt':'全部状态'},
      {'src':'/images/fukuan.png','txt':'待付款'},
      {'src':'/images/fahuo.png','txt':'已付款'},
      {'src':'/images/pingjia.png','txt':'待评价'}
    ],
    state: ['0','payment','canuse','comment'],    // 对应list 的状态
    busLists: [
      { 'src': '/images/scancode.png', 'txt': '扫码核销' }
    ],
    coachLists: [
      { 'src': '/images/reserveClass.png', 'txt': '课程排期' }
    ],
  },

  // 跳转到我的报名
  toMyEnroll: function () {
    this.login()
    wx.navigateTo({
      url: '/pages/myEnroll/index'
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
  },

  // 去登录
  toLogin:function(){
    this.login()
  },
 
  // 跳转到我的相册
  toPhotoAlbum:function(){
    this.login()
    wx.navigateTo({
      url: '/pages/myPhotoAlbum/index',
    })
  },

  // 跳转到个人中心
  toPersonCenter:function(){
    this.login()
    wx.navigateTo({
      url: '/pages/personCenter/index',
    })
  },

  // 我是商家
  bindBusi:function(e){
    var index = e.currentTarget.dataset.index
    if( index == 0 ){
      wx.scanCode({
        onlyFromCamera: true,     //仅仅相机
        success: (res) => {
          wx.navigateTo({
            url: '/pages/makeQR/index?code=' + res.result
          })
        }
      })
    }
  },

  // 我是教练
  bindCoach:function(e){
    var index = e.currentTarget.dataset.index
    if( index == 0 ){
      wx.navigateTo({
        url: '/pages/reserveClass/index'
      })
    }
  },

  // 跳转到我的预约页面
  toMyReserve:function(e){
    this.login()
    var index = e.currentTarget.dataset.index
    var state = this.data.state
    var list = this.data.list
    wx.navigateTo({
      url: '/pages/myReserve/index?stateIndex=' + state[index] +'&text=' + list[index].txt,
    })
  },

  //跳转到交易记录
  toPointsRecord:function(){
    this.login()
    wx.navigateTo({
      url: '/pages/pointsRecord/index'
    })
  },

  //跳转到积分记录
  toRecord:function(){
    this.login()
    wx.navigateTo({
      url: '/pages/record/index'
    })
  },

  //地址管理
  toDeliveryAddress:function(){
    this.login()
    wx:wx.navigateTo({
      url: '/pages/deliveryAddress/index'
    })
  },

  //跳到订单页
  toOrder:function(e){
    this.login()
    var idx=e.currentTarget.dataset.index
    wx.navigateTo({
      url: '/pages/order/index?index='+idx,
    })
  },

  //成为商家
  toEnter:function(e){
    var coach = e.currentTarget.dataset.coach
    var store = e.currentTarget.dataset.store
    wx.navigateTo({
      url: '/pages/enter/index?coach=' + coach + '&store=' + store
    })
  },

  // 进入我的调取页面信息接口
  comInfo:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'Ucenter/myHome',
      method: 'post',
      data: { token: app.globalData.token },
      header: { 'content-type' : 'application/x-www-form-urlencoded' },
      success:function(res){
        var data = res.data.data
        if( res.data.code == 1 ){
          that.setData({
            message: data.message,
            shouC: data.fav,
            yuE: data.money,
            jiFen: data.points,
            isCoach: data.isCoach,
            isStore: data.isStore
          })
        }
      }
    })
  },

  onLoad: function () {
    
  },

  onShow: function () {
    var token = app.globalData.token
    if (token != '') {
      this.setData({
        userName: app.globalData.userInfo.nickname,
        avatarUrl: app.globalData.userInfo.avatarurl
      })
    }
    
    this.comInfo()
  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  }
})
// pages/dome/dime.js
const app = getApp()
Page({
  data: {
    static: app.globalData.static,
    store_id: '',
    user: {},
    banner: ['/images/tennis3.png', '/images/tennis3.png', '/images/tennis3.png', '/images/tennis3.png', '/images/tennis3.png'],
    proLists:[],
    goods: []
  },

  // 登录检测
  login: function () {
    var token = app.globalData.token
    if (!token) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
  },

  // 跳转到商品分类
  toCateGory:function(){
    wx.switchTab({
      url: '/pages/cateGory/index',
    })
  },

  // 跳转到商品详情
  toProDetail:function(e){
    var goods_id = e.currentTarget.dataset.goods_id
    wx.navigateTo({
      url: '/pages/productDetail/index?goods_id=' + goods_id
    })
  },

  //跳转到预约详情
  toReserveDetail: function (e) {
    var title = e.currentTarget.dataset.title
    var id = e.currentTarget.dataset.id
    wx: wx.navigateTo({
      url: '/pages/reserveDetail/index?title=' + title + '&id=' + id
    })
  },

  //跳转到预约中心
  toReserveCenter: function (e) {
    wx: wx.navigateTo({
      url: '/pages/reserveCenter/index?rsortid=1' 
    })
  },

  // 关注
  attention:function(){
    var that = this
    that.login()
    var isFollow = that.data.user.isFollow
    var uid = that.data.user.uid
    var fans = that.data.user.fans 
    wx.request({
      url: app.globalData.https + 'Videos/setAttention',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        uid: uid
      },
      success: function (res) {
        if(res.data.code == 1){
          if (!isFollow) {
            that.setData({
              ['user.isFollow']: !isFollow,
              ['user.fans']: fans + 1
            })
          } else {
            that.setData({
              ['user.isFollow']: !isFollow,
              ['user.fans']: fans - 1
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

  // 请求页面数据
  pageInfo:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'Company/getCompanyInfo',
      method: 'post',
      header:{ 'content-type' : 'application/x-www-form-urlencoded' },
      data:{
        token: app.globalData.token,
        store_id: that.data.store_id,
        lat: app.globalData.latitude,
        lon: app.globalData.longitude
      },
      success:function(res){
        if(res.data.code == 1){
          that.setData({
            proLists: res.data.data.reservations,
            user: res.data.data.info,
            goods: res.data.data.goods
          })
        }
      }
    })
  },

  onLoad: function(options) {
    this.setData({
      store_id: options.store_id
    })
    this.pageInfo()
  },

  onShow: function() {
    
  },

  onPullDownRefresh: function() {

  },

  onReachBottom: function() {

  },

  onShareAppMessage: function() {

  }
})
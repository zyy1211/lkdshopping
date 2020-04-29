// pages/search/index.js
const app = getApp()
Page({
  data: {
    static: app.globalData.static,
    rsortid: 1,
    key: '',
    dataLists: [],
    pagenum: 1,
    isShow: true,
    loadMore: true
  },

  // 跳到对应的详情页面
  toDetail:function(e){
    var rsortid = e.currentTarget.dataset.rsortid
    var id = e.currentTarget.dataset.id
    if (rsortid == '3'){
      wx.navigateTo({
        url: '/pages/coach/index?id=' + id
      })
    }else{
      wx.navigateTo({
        url: '/pages/reserveDetail/index?id=' + id
      })
    }
  },

  // 关键字搜索
  keySearch: function(e){
    this.setData({
      key: e.detail.value
    })
  },

  // 点击搜索图片
  searchImg: function(){
    this.setData({
      pagenum: 1,
      dataLists: []
    })
    this.searchKey()
  },

  // 搜索列表
  searchKey: function () {
    var that = this
    wx.request({
      url: app.globalData.https + 'Reservations/search',
      data: {
        p: that.data.pagenum,
        key: that.data.key,
        lon: app.globalData.longitude,
        lat: app.globalData.latitude
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.code == 1 && res.data.data != '') {
          var arr1 = that.data.dataLists
          var arr2 = res.data.data
          var arr3 = arr1.concat(arr2)
          that.setData({
            dataLists: arr3,
            isShow: true
          })
        } else {
          that.setData({
            loadMore: false
          })
        }
        if (that.data.dataLists == '') {
          that.setData({
            isShow: false
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '网络错误，请下拉刷新',
          icon: 'none'
        })
      }
    })
  },

  onLoad: function (options) {
    this.searchKey()
  },

  onShow: function () {

  },

  onPullDownRefresh: function () {
    this.setData({
      pagenum: 1,
      dataLists: []
    })
    this.searchKey()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    var pagenum = this.data.pagenum + 1;  
    this.setData({
      pagenum: pagenum,  
    })
    if (this.data.loadMore) {
      this.searchKey()
    } else {
      wx.showToast({
        title: '没有更多数据了',
      })
    }
  }
})
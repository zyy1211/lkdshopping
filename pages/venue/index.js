const app = getApp()
Page({
  data: {
    lists: [],
    checkIndex: null,
    key: '',
    pageNum: 1,
    loadMore: true,
    isShow: true
  },

  // 关键字同步到 data 中
  keySearch: function (e) {
    this.setData({
      key: e.detail.value
    })
  },

  // 搜索场馆
  searchVenue:function(res){
    var that = this
    wx.request({
      url: app.globalData.https + 'Company/searchCg',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        key: that.data.key
      },
      success: function(res) {
        if (res.data.code == 1 && res.data.data != ''){
          var arr1 = that.data.lists;
          var arr2 = res.data.data;
          var arr3 = arr1.concat(arr2);
          that.setData({
            lists: arr3,
            isShow: true
          })
        }else{
          that.setData({
            loadMore: false
          })
        }
        if (that.data.lists == '') {
          that.setData({
            isShow: false
          })
        }
      }
    })
  },

  // 点击搜索图片
  searchImg: function () {
    this.setData({
      pageNum: 1,
      lists: []
    })
    this.searchVenue()
  },

  // 选择
  checked:function(e){
    var data = e.currentTarget.dataset.list
    var pages = getCurrentPages();                  // 获取页面栈
    var prevPage = pages[pages.length - 2];
    this.setData({
      checkIndex: e.currentTarget.dataset.index
    })
    prevPage.setData({
      data: data
    })
  },

  onLoad: function (options) {
    this.setData({
      lists: JSON.parse(options.lists)
    })
  },

  onShow: function () {

  },

  onPullDownRefresh: function () {
    this.setData({
      pageNum: 1,
      lists: []
    })
    this.searchVenue()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    var pagenum = this.data.pageNum + 1;
    this.setData({
      pageNum: pagenum,
    })
    if (this.data.loadMore) {
      this.searchVenue()
    } else {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }
  }
})
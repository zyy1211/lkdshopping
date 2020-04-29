const app = getApp()
Page({
  data: {
    contest_id: '',
    pagenum: 1,
    dataLists: [],
    loadMore: true
  },

  // 报名列表
  pageLists:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'News/getContestUsers',
      method: 'POST',
      data: {
        p: that.data.pagenum,
        contest_id: that.data.contest_id
      },
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.code == 1 && res.data.data != '') {
          var arr1 = that.data.dataLists
          var arr2 = res.data.data
          var arr3 = arr1.concat(arr2)
          that.setData({
            dataLists: res.data.data
          })
        } else {
          that.setData({
            loadMore: false
          })
        }
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      contest_id: options.contest_id
    })
    this.pageLists()
  },

  onShow: function () {

  },

  onHide: function () {

  },

  onPullDownRefresh: function () {
    this.setData({
      pagenum: 1,
      dataLists: []
    })
    this.pageLists()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    var pagenum = this.data.pagenum + 1;
    this.setData({
      pagenum: pagenum
    })
    if (this.data.loadMore) {
      this.pageLists()
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
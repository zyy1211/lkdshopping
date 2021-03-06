// pages/record/index.js
const app = getApp()
Page({
  data: {
    isShow: true,
    pagenum: 1,         //初始页默认值为1
    loadMore: true,
    recordLists:[]
  },

  // 请求积分明细接口
  recordDetail:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'Ucenter/getPoints',
      method: 'POST',
      data: {
        token: app.globalData.token,
        p: that.data.pagenum
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.code == 1 && res.data.data != '') {
          var arr1 = that.data.recordLists;
          var arr2 = res.data.data;
          var arr3 = arr1.concat(arr2);
          that.setData({
            recordLists: arr3,
            isShow: true
          })
        } else {
          that.setData({
            loadMore: false
          })
        }
        if (that.data.recordLists == '') {
          that.setData({
            isShow: false
          })
        }
      }
    })
  },

  onLoad: function (options) {
    this.recordDetail()
  },

  onShow: function () {

  },

  onPullDownRefresh: function () {
    this.setData({
      recordLists: [],
      pagenum: 1
    })
    this.recordDetail()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    var pagenum = this.data.pagenum + 1;       //获取当前页数并+1
    this.setData({
      pagenum: pagenum,                        //更新当前页数
    })
    if (this.data.loadMore) {
      this.recordDetail()                    //重新调用请求获取下一页数据
    } else {
      wx.showToast({
        title: '没有更多数据了',
      })
    }
  },

  onShareAppMessage: function () {

  }
})
// pages/zixunCenter/index.js
const app=getApp();
const http=app.globalData.https;
Page({
  data: {
    pageNum:1,
    static:app.globalData.static,
    loadMore: true,
    zxList: [],
    isShow: true
  },

  //跳转到咨询详情
  toZXdetail:function(e){
    wx.navigateTo({
      url: '/pages/zixunDetail/index?newsid=' + e.currentTarget.dataset.newsId,
    })
  },

  onLoad: function (options) {
    this.zxList();
  },

  //咨询列表
  zxList:function(){
    var that=this
    wx.request({
      url: http + 'News/getNewsList',
      method:'POST',
      data:{
        p: that.data.pageNum
      },
      header:{ 'content-type' : 'application/x-www-form-urlencoded' },
      success:function(res){
        if (res.data.code == 1 && res.data.data != '') {
          var arr1 = that.data.zxList;
          var arr2 = res.data.data;
          var arr3 = arr1.concat(arr2);
          that.setData({
            zxList: arr3,
            isShow: true
          })
        } else {
          that.setData({
            loadMore: false
          })
        }
        if (that.data.zxList == '') {
          that.setData({
            isShow: false
          })
        }
      }
    })
  },

  onPullDownRefresh: function () {
    this.setData({
      pageNum: 1,
      zxList: []
    })
    this.zxList()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    var pagenum = this.data.pageNum + 1;      
    this.setData({
      pageNum: pagenum,                     
    })
    if (this.data.loadMore) {
      this.zxList()             
    } else {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }
  },

  onShow: function () {

  }
})
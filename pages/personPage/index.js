// pages/personPage/index.js
const app = getApp()

Page({
  data: {
    uid: '',
    https: app.globalData.static,
    user: {},
    dynamicLists: [],
    pagenum: 1,
    loadMore: true,
    isShow: true
  },

  // 登录检测
  login: function () {
    var token = app.globalData.token
    if (!token) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
  },

  //点击预览轮播图图片
  previewImage: function (e) {
    var idx = e.currentTarget.dataset.idx
    var index = e.currentTarget.dataset.index
    var imgList = this.data.dynamicLists[index].lists
    var arr = []
    for (var i = 0, len = imgList.length; i < len; i++) {
      var list = this.data.https + imgList[i].limg
      arr.push(list)
    }
    wx.previewImage({
      current: arr[idx],      // 当前显示图片的http链接
      urls: arr,         // 需要预览的图片http链接列表
    })
  },

  // 点赞/取消点赞
  clickZan: function (e) {
    var that = this
    that.login()
    var social_id = e.currentTarget.dataset.social_id
    var index = e.currentTarget.dataset.index
    var isLike = that.data.dynamicLists[index].isLike
    var lnum = that.data.dynamicLists[index].lnum
    wx.request({
      url: app.globalData.https + 'Videos/setLike',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        typeid: 2,
        hostid: social_id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 1) {
          if (isLike){
            that.setData({
              ['dynamicLists[' + index + '].isLike']: !isLike,
              ['dynamicLists[' + index + '].lnum']: lnum - 1
            })
          }else{
            that.setData({
              ['dynamicLists[' + index + '].isLike']: !isLike,
              ['dynamicLists[' + index + '].lnum']: lnum + 1
            })
          }
        }
      }
    })
  },

  // 跳转到动态详情
  toDynamicDetail:function(e){
    var social_id = e.currentTarget.dataset.social_id
    wx.navigateTo({
      url: '/pages/dynamicDetail/index?social_id=' + social_id,
    })
  },

  // 关注/取消关注
  concern:function(){
    var that = this
    that.login()
    var isFollow = that.data.user.isFollow
    var uid = that.data.uid
    wx.request({
      url: app.globalData.https + 'Videos/setAttention',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: uid,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 1) {
          wx.showToast({
            title: res.data.msg
          })
          that.setData({
            ['user.isFollow']: !isFollow
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

  // 请求页面信息
  pageInfo:function(){
    var that = this
    var uid = that.data.uid
    wx.request({
      url: app.globalData.https + 'Social/personalHome',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: uid,
        token: app.globalData.token,
        p: that.data.pagenum
      },
      success: function (res){
        if(res.data.code == 1){
          if (res.data.code == 1 && res.data.data != '') {
            var arr1 = that.data.dynamicLists;
            var arr2 = res.data.data.lists;
            var arr3 = arr1.concat(arr2);
            that.setData({
              dynamicLists: arr3,
              isShow: true,
              user: res.data.data.data
            })
          } else {
            that.setData({
              loadMore: false
            })
          }
          if (that.data.dynamicLists == '') {
            that.setData({
              isShow: false
            })
          }
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

  onLoad: function (options) {
    this.setData({
      uid: options.uid
    })
    this.pageInfo()
  },

  onShow: function () {

  },

  onHide: function () {

  },

  onPullDownRefresh: function () {
    
  },

  onReachBottom: function () {
    var pagenum = this.data.pagenum + 1;       //获取当前页数并+1
    this.setData({
      pagenum: pagenum,                        //更新当前页数
    })
    if (this.data.loadMore) {
      this.pageInfo()                 
    } else {
      wx.showToast({
        title: '没有更多数据了',
      })
    }
  },

  onShareAppMessage: function () {

  }
})
// pages/dynamicDetail/index.js
const app = getApp()
Page({
  data: {
    isshare: 0,     // 0, 表示不是从分享进入, 1 表示是从分享进入
    social_id: '',
    https: app.globalData.static,
    dynamicLists: {},
    commentLists:[],
    val: '',
    share:{}
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
    var imgList = this.data.dynamicLists.lists
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

  // 跳转到个人主页
  toPersonPage:function(){
    var uid = this.data.dynamicLists.uid
    wx.navigateTo({
      url: '/pages/personPage/index?uid=' + uid
    })
  },

  // 写评论
  inputChange:function(e){
    this.setData({
      val: e.detail.value
    })
  },

  //发送评论到后台
  send: function () {
    var that = this;
    that.login()
    var val = that.data.val.replace(/(^\s*)|(\s*$)/g, "");
    var userInfo = that.data.dynamicLists.userinfo
    var cnum = that.data.dynamicLists.cnum
    if (val !== '') {
      var lists = [{
        avatarurl: app.globalData.userInfo.avatarurl,
        nickname: app.globalData.userInfo.nickname,
        content: val,
        time: '刚刚'
      }]
      wx.request({
        url: app.globalData.https + 'Message/addMessage',
        method: 'POST',
        data: {
          typeid: 2,
          hostid: that.data.social_id,
          token: app.globalData.token,
          content: val
        },
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: function (res) {
          if (res.data.code == 1) {
            wx.showToast({
              title: '评论成功！'
            })
            var sendPl = lists.concat(that.data.commentLists)
            that.setData({
              val: ''
            })
          } else{
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        },
        fail: function (err) {
          console.log(err)
          wx.showToast({
            title: '评论失败！',
            icon: 'none'
          })
        }
      })

    } else {
      wx.showToast({
        title: '评论不能为空！',
        icon: 'none',
      })
    }
  },

  // 点赞/取消点赞
  clickZan:function(e){
    var that = this
    that.login()
    var social_id = that.data.social_id
    var index = e.currentTarget.dataset.index
    var isLike = that.data.dynamicLists.isLike
    var lnum = that.data.dynamicLists.lnum
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
              ['dynamicLists.isLike']: !isLike,
              ['dynamicLists.lnum']: lnum - 1
            })
          }else{
            that.setData({
              ['dynamicLists.isLike']: !isLike,
              ['dynamicLists.lnum']: lnum + 1
            })
          }
        }
      }
    })
  },

  // 关注/取消关注
  care: function (e) {
    var that = this
    that.login()
    var uid = that.data.dynamicLists.uid
    var isFollow = that.data.dynamicLists.isFollow
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
          that.setData({
            ['dynamicLists.isFollow']: !isFollow
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  // 根据 social_id 发送请求
  pageInfo:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'Social/getSocialDetail',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        social_id: that.data.social_id,
        token: app.globalData.token
      },
      success:function(res){
        if(res.data.code == 1){
          that.setData({
            commentLists: res.data.data.comments,
            dynamicLists: res.data.data.content
          })
        }
      },
      fail:function(){
        wx.showModal({
          title: '友情提示',
          content: '网络错误',
          showCancel: false,
          success:function(res){
            wx.navigateBack()
          }
        })
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      social_id: options.social_id
    })
    if (options.isshare == 1) {
      this.setData({
        isshare: options.isshare
      })
    }
    this.pageInfo()
  },

  onShow: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  // 回到首页(分享的时候)
  backHome: function () {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },

  onShareAppMessage: function () {
    var img = this.data.dynamicLists.share.img
    var social_id = this.data.social_id
    var title = this.data.dynamicLists.content
    if(title.length > 15){
      title = title.substring(0,15) + '...'
    }
    return {
      title: title,
      path: '/pages/dynamicDetail/index?isshare=1&social_id=' + social_id,
      imageUrl: img
    }
  }
})
// pages/myPhotoAlbum/index.js
const app = getApp()
Page({
  data: {
    static: app.globalData.static,
    pagenum: 1,
    playIndex: null,      //用于记录当前播放的视频的索引值
    loadMore: true,
    isShow: true,
    albumLists: []
  },

  // 删除接口
  deleRequest:function(){
    var that = this
    
  },

  // 删除动态
  dele:function(e){
    var that = this
    var social_id = e.currentTarget.dataset.social_id
    var index = e.currentTarget.dataset.index
    var albumLists = that.data.albumLists
    wx.showModal({
      title: '友情提示',
      content: '确定删除这条动态吗？',
      success: function(result){
        if (result.confirm){
          wx.request({
            url: app.globalData.https + 'Ucenter/delTimeLine',
            method: 'post',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
              token: app.globalData.token,
              social_id: social_id
            },
            success: function (res) {
              if (res.data.code == 1) {
                wx.showToast({
                  title: res.data.msg
                })
                albumLists.splice(index, 1)
                that.setData({
                  albumLists
                })
              } else {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none'
                })
              }
            }
          })
        }
      }
    })
  },

  // 播放当前视频，关闭其他视频
  videoPlay: function (e) {
    var curIdx = e.currentTarget.dataset.index;
    if (this.data.playIndex != curIdx) {
      var videoContextPrev = wx.createVideoContext('video' + this.data.playIndex);
      videoContextPrev.pause();
      var video = wx.createVideoContext('video' + curIdx);
      video.play();
    }
    this.setData({
      playIndex: curIdx
    })
  },

  //点击预览轮播图图片
  previewImage: function (e) {
    var idx = e.currentTarget.dataset.idx
    var index = e.currentTarget.dataset.index
    var imgList = this.data.albumLists[index].lists
    var arr = []
    for (var i = 0, len = imgList.length; i < len; i++) {
      var list = this.data.static + imgList[i].limg
      arr.push(list)
    }
    wx.previewImage({
      current: arr[idx],      // 当前显示图片的http链接
      urls: arr,         // 需要预览的图片http链接列表
    })
  },

  // 跳转到动态详情
  toDynamicDetail: function (e) {
    var social_id = e.currentTarget.dataset.social_id
    wx.navigateTo({
      url: '/pages/dynamicDetail/index?social_id=' + social_id
    })
  },

  // 点赞/取消点赞
  clickZan: function (e) {
    var that = this
    var social_id = e.currentTarget.dataset.social_id
    var index = e.currentTarget.dataset.index
    var isLike = that.data.albumLists[index].isLike
    var lnum = that.data.albumLists[index].lnum
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
          if (isLike) {
            that.setData({
              ['albumLists[' + index + '].isLike']: !isLike,
              ['albumLists[' + index + '].lnum']: lnum - 1
            })
          } else {
            that.setData({
              ['albumLists[' + index + '].isLike']: !isLike,
              ['albumLists[' + index + '].lnum']: lnum + 1
            })
          }
        }
      }
    })
  },

  // 跳转到个人主页
  toPersonPage: function (e) {
    var uid = e.currentTarget.dataset.uid
    wx.navigateTo({
      url: '/pages/personPage/index?uid=' + uid
    })
  },

  // 页面数据请求
  albumData:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'Ucenter/myTimeLine',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        p: that.data.pagenum
      },
      success: function (res) {
        if (res.data.code == 1 && res.data.data != '') {
          var arr1 = that.data.albumLists;
          var arr2 = res.data.data;
          var arr3 = arr1.concat(arr2);
          that.setData({
            albumLists: arr3,
            isShow: true
          })
        } else {
          that.setData({
            loadMore: false
          })
        }
        if (that.data.albumLists == '') {
          that.setData({
            isShow: false
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '友情提示',
          content: '网络错误',
          showCancel: false
        })
      }
    })
  },

  onLoad: function (options) {
    this.albumData()
  },

  onShow: function () {

  },

  onPullDownRefresh: function () {
    this.setData({
      pagenum: 1,
      albumLists: []
    })
    this.albumData()
    wx.stopPullDownRefresh()  
  },

  onReachBottom: function () {
    var p = this.data.pagenum + 1
    this.setData({
      pagenum: p
    })
    if (this.data.loadMore) {
      this.albumData()
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
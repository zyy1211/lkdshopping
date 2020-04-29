const app = getApp()

Page({
  data: {
    https: app.globalData.static,
    method: false,          // true 代表从发布动态页面进来
    vList: [],
    pagenum: 1,
    playIndex: null,      //用于记录当前播放的视频的索引值
    loadMore: true,
    isShow: true,
    navIndex: 1,
    navTitle: ['关注', '动态'],
    dynamicLists: [],
    view: 0               // 是否显示视频 和私教
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

  // 跳转到动态详情
  toDynamicDetail: function (e) {
    var social_id = e.currentTarget.dataset.social_id
    wx.navigateTo({
      url: '/pages/dynamicDetail/index?social_id=' + social_id
    })
  },

  // 跳转到个人主页
  toPersonPage: function (e) {
    var uid = e.currentTarget.dataset.uid
    wx.navigateTo({
      url: '/pages/personPage/index?uid=' + uid
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
          if (isLike) {
            that.setData({
              ['dynamicLists[' + index + '].isLike']: !isLike,
              ['dynamicLists[' + index + '].lnum']: lnum - 1
            })
          } else {
            that.setData({
              ['dynamicLists[' + index + '].isLike']: !isLike,
              ['dynamicLists[' + index + '].lnum']: lnum + 1
            })
          }
        }
      }
    })
  },

  // 关注 
  care: function (e) {
    var that = this
    that.login()
    var uid = e.currentTarget.dataset.uid
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
            title: res.data.msg,
          })
          that.setData({
            dynamicLists: []
          })
          that.getNavIndex('1')
        }
      }
    })
  },

  // 去发动态
  toDynamic: function () {
    this.login()
    var token = app.globalData.token
    if(token != ''){
      wx.navigateTo({
        url: '/pages/publishingDynamic/index',
      })
    }
  },

  // 导航栏切换
  tapNav: function (e) {
    var index = e.currentTarget.dataset.index
    this.setData({
      navIndex: index,
      pagenum: 1,
      vList: [],
      dynamicLists: [],
    })
    this.getNavIndex('1')
  },

  // 查找头部导航的索引,发送请求
  getNavIndex: function (p) {
    var index = this.data.navIndex
    if (index == 0) {
      this.dynamicRequest('0', p)
    } else if (index == 1) {
      this.dynamicRequest('1', p)
    } else if (index == 2) {
      this.videoInfo('0',p)
    } else if (index == 3){
      this.videoInfo('1', p)
    }
  },

  //跳转视频详情
  toVideoDetail: function (e) {
    var hostid = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/videoDetail/index?hostid=' + hostid
    })
  },

  //渲染视频列表
  videoInfo: function (type,p) {
    var that = this
    wx.request({
      url: app.globalData.https + 'Videos/getVideosList',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        p: p,
        type: type,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 1 && res.data.data != '') {
          var arr1 = that.data.vList;
          var arr2 = res.data.data;
          var arr3 = arr1.concat(arr2);
            that.setData({
              vList: arr3,
              isShow: true
            })
        } else {
          that.setData({
            loadMore: false
          })
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
        if (that.data.vList == '') {
          that.setData({
            isShow: false
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '友情提示',
          content: '网络错误',
          showCancel: false,
          success: function (res) { }
        })
      }
    })
  },

  // 动态
  dynamicRequest: function (type, p) {
    var that = this
    wx.request({
      url: app.globalData.https + 'Social/TimeLine',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        type: type,
        p: p
      },
      success: function (res) {
        if (res.data.code == 1 && res.data.data != '') {
          var arr1 = that.data.dynamicLists;
          var arr2 = res.data.data;
          var arr3 = arr1.concat(arr2);
          that.setData({
            dynamicLists: arr3,
            isShow: true,
            view: res.data.view
          })
          if (res.data.view == 1){
            that.setData({
              navTitle: ['关注', '动态', '视频', '私教']
            })
          }
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
      },
      fail: function () {
        wx.showModal({
          title: '友情提示',
          content: '网络错误',
          showCancel: false,
          success: function (res) { }
        })
      }
    })
  },

  onLoad: function (options) {
    this.getNavIndex('1')
    
  },

  onShow: function (options) {
    if (this.data.method){
      this.setData({
        dynamicLists: [],
        vList: []
      })
      this.getNavIndex('1')
    }
  },

  //上拉加载
  onReachBottom: function () {
    var p = this.data.pagenum
    this.setData({
      pagenum: p + 1,
    })
    if (p == 1) {
      this.setData({
        loadMore: true
      })
    }
    if (this.data.loadMore) {
      this.getNavIndex(p + 1)
    } else {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }
  },

  onPullDownRefresh: function () {
    var that = this
    var index = that.data.navIndex
    this.setData({
      pagenum: 1,
      dynamicLists: [],
      vList: [],
    })
    this.getNavIndex(1)
    wx.stopPullDownRefresh()                // 停止下拉
  }
})
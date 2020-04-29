// pages/reserveClass/index.js
const app = getApp();

Page({
  data: {
    static: app.globalData.static,
    isShow: true,
    pagenum: 1,
    loadMore: true,
    reserveLists: [],
    status: 'canuse'
  },

  //切换选项卡
  look: function (e) {
    var status = e.currentTarget.dataset.status
    this.setData({
      reserveLists: [],
      pagenum: 1,
      status: status
    })
    this.orderState()
  },

  // 跳转到教练课程详情
  toCoachClassDetail:function(e){
    var info = e.currentTarget.dataset.info
    wx.navigateTo({
      url: '/pages/coachClassDetail/index?data=' + JSON.stringify(info)
    })
  },

  orderState: function () {
    var that = this
    wx.request({
      url: app.globalData.https + 'Ucenter/myOrderOfCoach',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        status: that.data.status,
        p: that.data.pagenum                          //  从数据里获取当前页数
      },
      success: function (res) {
        if (res.data.code == 1 && res.data.data != '') {
          var arr1 = that.data.reserveLists;
          var arr2 = res.data.data;
          var arr3 = arr1.concat(arr2);
          that.setData({
            reserveLists: arr3,
            isShow: true
          })
        } else {
          that.setData({
            loadMore: false
          })
        }
        if (that.data.reserveLists == '') {
          that.setData({
            isShow: false
          })
        }
      },
      fail: function () {
        wx.navigateBack()
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  onLoad: function (options) {
    this.orderState()
  },

  onShow: function () {

  },

  onPullDownRefresh: function () {
    this.setData({
      reserveLists: [],
      pagenum: 1
    })
    this.orderState()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    var pagenum = this.data.pagenum + 1;       //获取当前页数并+1
    this.setData({
      pagenum: pagenum,                        //更新当前页数
    })
    if (this.data.loadMore) {
      this.orderState()                    //重新调用请求获取下一页数据
    } else {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }
  }
})
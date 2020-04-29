// pages/sign/index.js
const app = getApp()
Page({
  data: {
    signOptions: [
      { whichDay: '第1天', signImg: '/images/star3.png', points: '+1' },
      { whichDay: '第2天', signImg: '/images/star3.png', points: '+1' },
      { whichDay: '第3天', signImg: '/images/star3.png', points: '+1' },
      { whichDay: '第4天', signImg: '/images/star3.png', points: '+1' },
      { whichDay: '第5天', signImg: '/images/star3.png', points: '+1' },
      { whichDay: '第6天', signImg: '/images/star3.png', points: '+1' },
      { whichDay: '奖励',  signImg: '/images/star3.png', points: '+1' },
    ],
    count:{},
    signLists:[],       //签到列表
    pagenum: 1, 
    loadMore: true
  },

  // 立即签到
  sign:function(){
    var that = this
    var isSign = that.data.count.isSign
    if ( !isSign ){
      wx.showToast({
        title: '今天已经签到'
      })
      return
    }
    wx.request({
      url: app.globalData.https + 'Index/setSign',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if ( res.data.code == 1 ) {
          wx.showToast({
            title: res.data.msg
          })
          that.setData({
            pagenum: 1,
            signLists: [],
            loadMore: true
          })
          that.signRecord()
        } 
      }
    })
  },

  // 请求签到记录
  signRecord:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'Index/getSigninList',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        p: that.data.pagenum
      },
      success: function (res) {
        if (res.data.code == 1 && res.data.data.lists != '') {
          var arr1 = that.data.signLists;
          var arr2 = res.data.data.lists;
          var arr3 = arr1.concat(arr2);
          that.setData({
            signLists: arr3,
            count: res.data.data.count
          })
          that.starLight()
        } else {
          that.setData({
            count: res.data.data.count,
            loadMore: false
          })
        }
      }
    })
  },

  // 点亮星星
  starLight:function(){
    var days = this.data.count.count_days
    for (var i = 0; i < days; i++) {
      this.setData({
        ['signOptions[' + i + '].signImg']: '/images/star4.png',
        ['signOptions[' + i + '].isLight']: true
      })
    }
  },

  onLoad: function (options) {
    this.signRecord()
  },

  onShow: function () {

  },

  onPullDownRefresh: function () {
    this.setData({
      pagenum: 1,
      signLists: []
    })
    this.signRecord()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    var pagenum = this.data.pagenum + 1;       //获取当前页数并+1
    this.setData({
      pagenum: pagenum                      //更新当前页数
    })
    if (this.data.loadMore) {
      this.signRecord()                    //重新调用请求获取下一页数据
    } else {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }
  }
})
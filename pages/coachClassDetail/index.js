// pages/coachClassDetail/index.js
const app = getApp()
Page({
  data: {
    coach: {},
    students: [],
    dataInfo: {},
    end_info: {}
  },

  // 确认上课
  confirm:function(e){
    var that = this
    var i = e.currentTarget.dataset.index
    var order_id = that.data.students[i].order_id
    wx.request({
      url: app.globalData.https + 'Ucenter/setOrderStatusFromCoach',
      method: 'post',
      header:{ 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        order_id: order_id
      },
      success:function(res){
        if(res.data.code == 1){
          that.setData({
            ['students[' + i +'].status']: 1
          })
          wx.showToast({
            title: res.data.msg
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

  onLoad: function (options) {
    var data = JSON.parse(options.data)
    var that = this
    that.setData({
      dataInfo: data
    })
    wx.request({
      url: app.globalData.https +  'Ucenter/myOrderDetail',
      method: 'post',
      header: { 'content-type' : 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        years: data.years,
        dates: data.dates,
        times: data.times,
        res_id: data.res_id
      },
      success:function(res){
        if(res.data.code == 1){
          that.setData({
            coach: res.data.data.coach,
            students: res.data.data.students,
            end_info: res.data.data.end_info
          })
        }
      },
      fail:function(){
        wx.navigateBack()
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  onShow: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  }
})
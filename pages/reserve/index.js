// pages/reserve/index.js
const app=getApp()

Page({
  data: {
    idx: 1,
    isMask: false,
    bannerLists: [],
    static: app.globalData.static,
    telModialog: false,
  },

  //关闭模态框
  closeMask: function () {
    this.setData({
      isMask: false
    })
  },

  //预约
  toLinks:function(e){
    var i = e.currentTarget.dataset.index
    var link = this.data.bannerLists[i].links
    wx.navigateTo({
      url: link
    })
  },

  // 接口请求
  dataLists:function(){
    var that = this 
    wx.request({
      url: app.globalData.https + 'Reservations/getReservCenter',
      method: 'post',
      header:{ 'content-type' : 'application/x-www-form-urlencoded' },
      success: function(res){
        if(res.data.code == 1){
          that.setData({
            bannerLists: res.data.data
          })
        }
      }
    })
  },

  onLoad: function (options) {
    
  },

  onShow: function () {
    this.dataLists()
  }
})
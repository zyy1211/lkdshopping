// pages/payInfo/index.js
const app = getApp()
Page({
  data: {
    info: { title: '2019年XX杯 团体赛事 报名费用', order_no: '4813513521', time: '2019-10-22 23:00:00', price: '1000.00', gathering: '栎刻动体育' },
  },

  // 立即支付
  pay:function(){
    var that = this
    wx.request({
      url: app.globalData.https + '',
      method: 'post',
      header: { 'content-type':'application/x-www-form-urlencoded' },
      data: {

      },
      success:function(res){
        if(res.data.code == 1){

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

  },

  onShow: function () {

  }
})
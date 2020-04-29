// pages/reserveEvaluation/index.js
const app = getApp()

Page({
  data: {
    proData: {},
    point: 1,
    content: '',
    val: ''
  },

  // 星星评分
  clickStar:function(e){
    this.setData({
      point: e.currentTarget.dataset.point
    })
  },

  // 评价
  inputText:function(e){
    this.setData({
      val: e.detail.value
    })
  },

  // 提交
  submit:function(){
    var that = this
    var points = that.data.point
    var content = that.data.val
    var data = that.data.proData
    if (content == '') {
      wx.showToast({
        title: '评价不能为空！',
        icon: 'none'
      })
      return
    }
    wx.request({
      url: app.globalData.https + 'Evaluation/addEvaluation',
      method: 'post',
      header: { 'content-type' : 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        hostid: data.hostid,
        order_id: data.order_id,
        uid: data.uid,
        typeid: 1,
        points: points,
        content: content,
        attrid: 0
      },
      success:function(res){
        if(res.data.code == 1){
          wx.showToast({
            title: res.data.msg,
            duration: 2000,
            success:function(){
              wx.navigateBack()
            }
          })
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      proData: JSON.parse(options.data)
    })
  },

  onShow: function () {

  },

  onHide: function () {

  }
})
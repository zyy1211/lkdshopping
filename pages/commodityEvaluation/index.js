// pages/commodityEvaluation/index.js
const app = getApp()
Page({
  data: {
    val: '',
    order_id: '',
    uid: '',
    point: 1,
    goods: {},
    static: app.globalData.static
  },

  // 星星评分
  clickStar:function(e){
    var point = e.currentTarget.dataset.point
    this.setData({ point })
  },

  //评价留言
  inputText:function(e){
    var val = e.detail.value
    this.setData({ val })
  },

  //提交评价留言
  submit:function(){
    var that = this
    var val = that.data.val
    var data = that.data.goods
    var uid = that.data.uid
    var point = that.data.point
    var order_id = that.data.order_id
    if( val == '' ){
      wx.showToast({
        title: '评价不能为空！',
        icon: 'none'
      })
      return
    }
    wx.request({
      url: app.globalData.https +  'Evaluation/addEvaluation',
      method: 'post',
      header: { 'content-type' : 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        typeid: 2,
        hostid: data.goods_id,   
        uid: uid, 
        order_id: order_id,
        content: val,
        points: point,
        attrid: data.order_goods_id
      },
      success:function(res){
        if( res.data.code == 1 ){
          wx.showToast({
            title: res.data.msg,
            duration: 2000,
            success: function () {
              setTimeout(function(){
                wx.navigateBack()
              },1500)
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
      goods: JSON.parse(options.goods),
      uid: options.uid,
      order_id: options.order_id
    })
  },

  onShow: function () {

  },

  onHide: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})
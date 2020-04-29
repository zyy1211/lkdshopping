
const app=getApp();
Page({
  data: {
    aid: '',
    isshare: 0,     // 0, 表示不是从分享进入, 1 表示是从分享进入
    isFlag: false,
    content:'',
    dataObj: {},
    share: {},    // 分享按钮中的分享图片
    isteam: false,
    isModial: false,
    isConfirm: false
  },

  // 生成海报
  createPoster: function () {
    this.setData({
      isFlag: !this.data.isFlag
    })
    this.selectComponent('#getPoster').getAvaterInfo();
  },

  // 同意声明
  confirm:function(){
    var price_single = this.data.dataObj.price_single
    var end_time = this.data.dataObj.end_time
    this.setData({
      isConfirm: true,
      isModial: !this.data.isModial
    })
    wx.navigateTo({
      url: '/pages/singleEnroll/index?type=0&end_time=' + end_time + '&aid=' + this.data.aid + '&price_single=' + price_single
    })
  },

  // 切换遮罩层
  tapmMask: function (e) {
    var type = e.currentTarget.dataset.type
    if (type == '1'){
      this.setData({
        isModial: !this.data.isModial
      })
    } else if (type == '2'){
      this.setData({
        isFlag: !this.data.isFlag,
      })
    }
  },

  // 立即报名
  enrollBtn: function () {
    var isteam = this.data.isteam
    var join_single = this.data.dataObj.join_single
    var join_team = this.data.dataObj.join_team
    var price_team = this.data.dataObj.price_team
    var price_single = this.data.dataObj.price_single
    var end_time = this.data.dataObj.end_time
    var isConfirm = this.data.isConfirm
    if (!isConfirm){
      this.setData({
        isModial: !this.data.isModial
      })
    } else {
      wx.navigateTo({
        url: '/pages/singleEnroll/index?type=0&end_time=' + end_time + '&aid=' + this.data.aid + '&price_single=' + price_single
      })
    }
    /* if (!isteam) {
      if (join_single == '0'){
        wx.showToast({
          title: '请不要重复报名',
          icon: 'none'
        })
        return
      }
      wx.navigateTo({
        url: '/pages/singleEnroll/index?type=0&end_time=' + end_time + '&aid=' + this.data.aid + '&price_single=' + price_single
      })
    } else {
      if (join_team == '0') {
        wx.showToast({
          title: '请不要重复报名',
          icon: 'none'
        })
        return
      }
      wx.navigateTo({
        url: '/pages/teamEnroll/index?type=1&end_time=' + end_time + '&aid=' + this.data.aid + '&price_team=' + price_team
      })
    } */
  },

  // 单选赛事
  tapContest: function (e) {
    var type = e.currentTarget.dataset.type
    if (type == '1') {
      this.setData({
        isteam: false
      })
    } else if (type == '2') {
      this.setData({
        isteam: true
      })
    }
  },

  //咨询列表
  zxLists:function(){
    var that=this
    wx.request({
      url: app.globalData.https + 'Active/getActiveDetail',
      method:'POST',
      data:{
        token: app.globalData.token,
        aid: that.data.aid
      },
      header:{ 'content-type' : 'application/x-www-form-urlencoded' },
      success:function(res){
        var data=res.data.data
        if( res.data.code == 1 ){
          that.setData({
            dataObj: data,
            share: data.share,
          })
          if (data.content && data.content != ''){
            that.setData({
              content: data.content.replace(/\<img/gi, '<img class="rich-img" ')
            })
          }
        }
      }
    })
  },

  onLoad: function (options) {
    if (options.isshare == 1) {
      this.setData({
        isshare: options.isshare,
        aid: options.aid
      })
    }else{
      this.setData({
        aid: options.aid
      })
    }
    
  },

  onShow: function () {
    var token = app.globalData.token
    if(token == ''){
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    this.zxLists();
  },

  // 回到首页(分享的时候)
  backHome: function () {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  
  onShareAppMessage: function () {
    var img = this.data.share.img
    var aid = this.data.aid
    var title = this.data.dataObj.title
    return {
      title: title,
      path: '/pages/activityEnroll/index?isshare=1&aid=' + aid,
      imageUrl: img
    }
  }
})
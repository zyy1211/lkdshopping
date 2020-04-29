// pages/zixunCenter/index.js
const app=getApp();
const https=app.globalData.https;
Page({
  data: {
    isshare: 0,     // 0, 表示不是从分享进入, 1 表示是从分享进入
    static:app.globalData.static,
    newsid:null,
    contest_id: '',
    typeid: '',
    vnum:0,
    newstime:'',
    content:'',
    title:'',
    zxList: [],
    isConstest: false,
    isFlag: false,
    share: {}
  },

  // 生成海报
  createPoster: function () {
    this.setData({
      isFlag: !this.data.isFlag
    })
    this.selectComponent('#getPoster').getAvaterInfo();
  },

  // 切换遮罩层
  tapmMask: function () {
    this.setData({
      isFlag: !this.data.isFlag
    })
  },

  // 本页跳转
  toZXdetail: function (e) {
    wx.navigateTo({
      url: '/pages/zixunDetail/index?newsid=' + e.currentTarget.dataset.news_id,
    })
  },

  // 立即报名
  comeSignUp:function(){
    wx.navigateTo({
      url: '/pages/signUp/index?contest_id=' + this.data.contest_id
    })
  },

  // 已报名
  enroll:function(){
    wx.navigateTo({
      url: '/pages/enroll/index?contest_id=' + this.data.contest_id
    })
  },

  //咨询列表
  zxLists:function(){
    var that=this
    wx.request({
      url: https + 'News/newsContent',
      method:'POST',
      data:{
        news_id: that.data.newsid
      },
      header:{ 'content-type' : 'application/x-www-form-urlencoded' },
      success:function(res){
        var data=res.data.data.data
        var content='nodes[0].children[0].text'
        if( res.data.code == 1 ){
          that.setData({
            contest_id: data.contest_id,
            isConstest: data.isConstest,
            typeid: data.typeid,
            vnum: data.vnum,
            newstime: data.newstime,
            title: data.title,
            content: data.content.replace(/\<img/gi, '<img class="rich-img" '),
            zxList: res.data.data.lists,
            share: data.share
          })
        }
      }
    })
  },

  onLoad: function (options) {
    var that = this
    if (options.isshare == 1) {
      that.setData({
        isshare: options.isshare
      })
    }
    if (options.newsid) {
      that.setData({
        newsid: options.newsid
      })
    }
    this.zxLists();
  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShow: function () {
    
  },

  // 回到首页(分享的时候)
  backHome: function () {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  onShareAppMessage: function () {
    var img = this.data.share.img
    var newsid = this.data.newsid
    var title = this.data.title
    return {
      title: title,
      path: '/pages/zixunDetail/index?isshare=1&newsid=' + newsid,
      imageUrl: img
    }
  }
})
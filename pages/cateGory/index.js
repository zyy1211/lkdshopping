// pages/cateGory/index.js
const app=getApp()
const https=app.globalData.https

Page({
  data: {
    telModialog: false,
    idx: 3,
    isMask: false,
    static:app.globalData.static,
    navTitle:[],
    listid:0,
    isShow:true,
    bannerUrl:'',
  },

  //关闭模态框
  closeMask: function () {
    this.setData({
      isMask: false
    })
  },

  //跳转到商品列表
  toProLists:function(e){
    var category_id=e.currentTarget.dataset.category_id
    var category_name=e.currentTarget.dataset.category_name
    wx.navigateTo({
      url: '/pages/productLists/index?category_id=' + category_id + '&category_name=' + category_name,
    })
  },

  //点击导航栏
  showList:function(e){
    console.log(e);
    var index = e.currentTarget.dataset.index
    var nav = this.data.navTitle
    this.setData({
      listid: index
    });
    app.globalData.bannerUrl = '';
    if(nav[index].parentid == ''){
      this.setData({
        isShow: false
      })
    }else{
      this.setData({
        isShow: true
      })
    }
  },

  //内容数据请求
  conRequest:function(){
    var that = this
    wx.request({
      url: https +'Goods/GoodsCategory',
      method:'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success:function(res){
        var data = res.data.data
        if(res.data.code == 1){
          that.setData({
            navTitle: data
          });
          if(that.data.bannerUrl != ''){
            that.setData({
              listid:data.length -1
            })
          }
        }
      }
    })
  },

  onLoad: function (options) {
   console.log(options);
   if(options.bannerUrl == "1"){
     this.setData({
      bannerUrl:1
     });
     app.globalData.bannerUrl = "1"
   }
  },

  onShow: function () {
    this.setData({
      bannerUrl:app.globalData.bannerUrl
    })
    // console.log(app.globalData.bannerUrl);
    this.conRequest(); 
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
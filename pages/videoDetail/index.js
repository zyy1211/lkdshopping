// pages/videoDetail/index.js
const app=getApp();
const phoneNumber = require('../../utils/util.js');
Page({
  data: {
    isRequest: true,        // ture 需要请求，false不需要
    maxLength:500,
    pLength:true,
    pageNum:1,
    token: app.globalData.token,
    hostid:'',
    userName:'柚子君(ｏ^-^)',
    avatorSrc:'/images/avator.png',
    date:'',
    isFollow: false,
    uid:'',
    isLike: false,
    lnum:0,
    videoHttps:app.globalData.static,
    videoLink:'',
    userInput:'',
    plUserList:[]
  },

  // 登录检测
  login: function () {
    var token = app.globalData.token
    if (!token || token == '') {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    var isRequest = this.data.isRequest
    if (isRequest) {
      this.requestPhone()
    }
  },

  // 调用微信手机号 API
  getPhone: function (e) {
    var data = {
      token: app.globalData.token,
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv
    }
    var that = this
    phoneNumber.getPhoneNumber(data, res => {   // 回调拿到返回值
      if (res == 'success') {
        that.setData({
          telModialog: false
        })
      } else if (res == 'fail') {
        that.setData({
          telModialog: true
        })
      }
    })
  },

  // 请求手机号是否绑定
  requestPhone: function () {
    var that = this
    var telModialog = that.data.telModialog
    phoneNumber.bindPhone({ token: app.globalData.token }, res => {
      if (res.phone != '') {
        that.setData({
          telModialog: false,
          isRequest: false
        })
      } else {
        that.setData({
          telModialog: true
        })
      }
    })
  },

  //点赞请求接口
  zanRequest: function (isLike){
    var that=this
    var lnum = that.data.lnum
    wx.request({
      url: app.globalData.https + 'Videos/setLike',
      method: 'POST',
      data: {
        typeid: '1',
        hostid: that.data.hostid,
        token: app.globalData.token
      },
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.code == 1) {
          if (!isLike){
            that.setData({
              lnum: lnum + 1,
              isLike: !isLike
            })
          }else{
            that.setData({
              lnum: lnum - 1,
              isLike: !isLike
            })
          }
        }
      }
    })
  },

  //点赞
  clickZan:function(){
    this.login()
    var that=this
    var isLike = that.data.isLike
    that.zanRequest(isLike)
  },

  //关注请求接口
  gzRequest: function (isFollow) {
    var that = this
    wx.request({
      url: app.globalData.https + 'Videos/setAttention',
      method: 'POST',
      data: {
        uid: that.data.uid,
        token: app.globalData.token
      },
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.code == 1) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          that.setData({
            isFollow: !isFollow
          })
        }else if(res.data.code == -1 ){
          wx.showToast({
            title: res.data.msg,
            icon:'none'
          })
        }
      }
    })
  },

  //关注
  gz:function(){
    this.login()
    var isFollow = this.data.isFollow
    this.gzRequest(isFollow)
  },

  //输入框文字长度
  inputLen:function(e){
    var len=e.detail.value.length;
    var max=this.data.maxLength;
    if(len == max){
      wx.showToast({
        title: '文字太长了！',
        icon:'none'
      })
    }else{
      //获得输入框内容
      this.setData({
        userInput: e.detail.value
      })
    }
  },

  //写评论，发送请求到后台
  send:function(){
    var userInfo = app.globalData.userInfo
    var that=this;
    that.login()
    if(userInfo !== null){
      var plCont = that.data.userInput.replace(/(^\s*)|(\s*$)/g, "");
      if (plCont !== '' ){
        that.setData({
          pLength: true
        })
        var lists = [{
          avatarurl: userInfo.avatarurl,
          nickname: userInfo.nickname,
          content: that.data.userInput
        }]
        wx.request({
          url: app.globalData.https +'Message/addMessage',
          method:'POST',
          data: {
            typeid: 1,
            hostid: that.data.hostid,
            token: app.globalData.token,
            content: that.data.userInput
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success:function(res){
            if(res.data.code ==1 ){
              wx.showToast({
                title: '评论成功！'
              })
              var sendPl = lists.concat(that.data.plUserList)
              that.setData({
                userInput: ''
              })
            }else if(res.data.code == -1){
              wx.showToast({
                title: res.data.msg,
                icon:'none'
              })
            }
          },
          fail:function(err){
            wx.showToast({
              title: '评论失败！',
              icon:'none'
            })
          }
        })
        
      }else{
        wx.showToast({
          title: '评论不能为空！',
          icon: 'none',
        })
      }
    }
  },

  //请求中间部分头像和名称
  userInfo:function(){
    var that=this
    wx.request({
      url: app.globalData.https + 'Videos/videoContent',
      method: 'POST',
      data: {
        video_id: that.data.hostid,
        token: app.globalData.token
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var data = res.data.data
        if (res.data.code == 1) {
          that.setData({
            userName: data.nickname,
            avatorSrc: data.avatarurl,
            isLike: data.isLike,
            date: data.time,
            videoLink: data.video_link,
            isFollow: data.isFollow,
            isLike: data.isLike,
            lnum: data.lnum,
            uid: data.uid
          })
        }
      }
    })
  },

  onLoad: function (options) {
    var that=this
    that.setData({
      hostid: options.hostid
    })

    that.userInfo()

    //请求精彩评论接口
    var page=that.data.pageNum;
    wx.request({
      url: app.globalData.https + 'Message/getMessage',
      method:'POST',
      header:{ 'content-type' : 'application/x-www-form-urlencoded' },
      data:{
        typeid: 1,
        hostid: that.data.hostid,
        p: page
      },
      success:function(res){
        if( res.data.code == 1 ){
          if(res.data.data.length == 0){
            that.setData({
              pLength:false
            })
          }
          var arr = that.data.plUserList.concat(res.data.data)
          that.setData({
            plUserList: arr
          })
        }
      }
    })
  },

  onShow: function () {
    this.userInfo()
  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {
    
  }
})
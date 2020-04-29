// pages/personCenter/index.js
const app = getApp()
Page({
  data: {
    avatarUrl: '',
    nickName: '',
    region:[],
    gender: '',
    phone: '',
    isClick: false
  },

  // 选择性别
  checkSex:function(e){
    var gender = e.currentTarget.dataset.gender
    this.setData({
      gender: gender
    })
  },

  // 更改昵称
  inputVal:function(e){
    this.setData({
      nickName: e.detail.value
    })
  },

  // 更改头像
  changeAvatar:function(){
    var that = this
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success(res) {
        wx.uploadFile({
          url: app.globalData.https + 'Ucenter/uploadFacepic', 
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            token: app.globalData.token
          },
          success(result) {
            var data = JSON.parse(result.data)
            if (data.code == 1){
              that.setData({
                avatarUrl: app.globalData.static + data.data
              })    
            }
          }
        })
      }
    })
  },

  // 保存修改
  submit:function(){
    var that = this
    var nickName = that.data.nickName
    if (nickName == ''){
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      })
      return
    }
    wx.request({
      url: app.globalData.https + 'Ucenter/updateUserInfo',
      method: 'post',
      header: { 'content-type' : 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        nickName: nickName,
        img: that.data.avatarUrl,
        phone: that.data.phone,
        gender: that.data.gender,
        province: that.data.region[0],
        city: that.data.region[1],
        area: that.data.region[2]
      },
      success:function(res){
        if( res.data.code == 1 ){
          app.globalData.userInfo.avatarurl = res.data.data.avatarurl
          app.globalData.userInfo.nickname = res.data.data.nickname
          wx.navigateBack()
          wx.showToast({
            title: res.data.msg
          })
        } else if ( res.data.code == 0 ){
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    }) 
  },

  // 获取手机号码
  getPhoneNumber:function(e){
    var that = this
    wx.request({
      url: app.globalData.https + 'Ucenter/getPhoneNumber',
      method: 'post',
      header:{'content-type' : 'application/x-www-form-urlencoded'},
      data:{
        token: app.globalData.token,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      },
      success:function(res){
        if(res.data.code == 1){
          that.setData({
            phone: res.data.data.phone,
            isClick: true
          })
        }
      }
    })
  },

  // 所在城市
  bindRegionChange:function(e){
    var val = e.detail.value
    this.setData({
      region: val
    })
  },

  // 请求页面信息
  pageInfo: function () {
    var that = this
    wx.request({
      url: app.globalData.https + 'Ucenter/getUserInfo',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: { token: app.globalData.token },
      success: function (res) {
        var data = res.data.data
        if (res.data.code == 1) {
          if(data.phone != ''){
            that.setData({
              phone: data.phone,
              isClick: true,
            })
          }
          that.setData({
            avatarUrl: data.avatarurl,
            nickName: data.nickname,
            gender: data.gender,
            region:[data.province,data.city,data.area]
          })
        }
      }
    })
  },

  onLoad: function (options) {
    this.pageInfo()
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
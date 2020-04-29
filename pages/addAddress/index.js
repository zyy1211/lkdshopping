// pages/addAddress/index.js
const app=getApp();
const https=app.globalData.https;
Page({
  data: {
    address_id:'',
    userName:'',
    region: [],
    sexLists: ['先生','女士'],
    idxSex:0,
    sex:'先生',
    idxDz:0,
    tel:'',
    dzLists:['家','学校','公司'],
    tags:'家',
    detail:''
  },

  //确定，提交
  confirm:function(e){
    var that=this
    var val = e.detail.value;
    var region = that.data.region;
    var flag = /^1[3456789]\d{9}$/.test(val.tel);
    if ( val.userName == '' ){
      wx.showToast({
        title: '请输入联系人姓名',
        icon: 'none'
      })
      return
    } else if ( val.tel == '' || !flag ) {
      wx.showToast({
        title: '电话号码不正确',
        icon:'none'
      })
      return
    } else if ( val.region == '' ) {
      wx.showToast({
        title: '请选择区域',
        icon:'none'
      })
      return
    }else if ( val.detail == '' ) {
      wx.showToast({
        title: '请填写详细地址',
        icon:'none'
      })
      return
    }
    wx.request({
      url: app.globalData.https + 'UserAddress/add',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: app.globalData.token,
        address_id: that.data.address_id,
        name: val.userName,
        phone: val.tel,
        province_id: region[0],
        city_id: region[1],
        region_id: region[2],
        detail: val.detail,
        sex: that.data.sex,
        tags: that.data.tags
      },
      success: function(res) {
        if(res.data.code == 1){
          wx.showToast({
            title: res.data.msg
          })
          setTimeout(function(){
            wx.navigateBack();
          },1000)
        } else if (res.data.code == -1) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
      }
    })
  },

  //选择省、市、区
  bindRegionChange:function(e){
    this.setData({
      region: e.detail.value
    })
  },

  //切换选择性别
  tapSex:function(e){
    this.setData({
      sex: e.currentTarget.dataset.sex
    })
  },

  //切换tags
  tapDz:function(e){
    this.setData({
      tags: e.currentTarget.dataset.tags
    })
  },

  //请求 address_id 信息
  addrInfo:function(){
    var that=this
    wx.request({
      url: https + 'UserAddress/detail',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: app.globalData.token,
        address_id: that.data.address_id
      },
      success: function (res) {
        var data=res.data.data.detail
        if(res.data.code == 1){
          var region=that.data.region
          region[0] = data.province_id
          region[1] = data.city_id
          region[2] = data.region_id
          that.setData({
            sex: data.sex,
            tags: data.tags,
            userName: data.name,
            tel: data.phone,
            region: region,
            detail: data.detail
          })
        } else {
          wx:wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  onLoad: function (options) {
    if(options.address_id != ''){
      this.setData({
        address_id: options.address_id
      })
      this.addrInfo()
    }
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
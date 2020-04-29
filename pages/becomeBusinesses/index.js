const paySuccess = require('../../utils/util.js');
const app=getApp()
Page({
  data: {
    zt: '',
    status: {},
    flag: true,
    imgUrl: '/images/avator.png',
    businessImg: '',
    region: [],
    ctel: '',
    info: {},
    id: ''
  },

  // 提示框
  toast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none'
    })
  },

  // 重新提交
  resub: function () {
    var that = this
    that.setData({
      zt: 1
    })
    wx.request({
      url: app.globalData.https + 'Company/getMyJoinDetail',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: { token : app.globalData.token },
      success:function(res){
        if(res.data.code == 1) {
          that.setData({
            info: res.data.data,
            imgUrl: res.data.data.logo,
            ctel: res.data.data.ctel,
            region: res.data.data.area,
            id: res.data.data.id,
            businessImg: res.data.data.yyzz,
            flag: false
          })
        }
      }
    })
  },

  //选择省、市、区
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },

  // 获取手机号码
  getPhoneNumber: function (e) {
    var that = this
    wx.request({
      url: app.globalData.https + 'Ucenter/getPhoneNumber',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            ctel: res.data.data.phone
          })
        }
      }
    })
  },

  // 公司logo接口
  requestAvatar: function (res) {
    var that = this
    wx.uploadFile({
      url: app.globalData.https + 'Ucenter/uploadFacepic',
      filePath: res.tempFilePaths[0],
      name: 'file',
      formData: {
        token: app.globalData.token
      },
      success(result) {
        var data = JSON.parse(result.data)
        if (data.code == 1) {
          that.setData({
            imgUrl: app.globalData.static + data.data
          })
        } else {
          that.toast(data.msg)
        }
      },
      fail:function(){
        that.toast('网络错误，上传失败')
      }
    })
  }, 

  // 营业执照接口
  requestBusiness: function (res) {
    var that = this
    wx.uploadFile({
      url: app.globalData.https + 'Company/uploadCertificate',
      filePath: res.tempFilePaths[0],
      name: 'file',
      formData: {
        token: app.globalData.token
      },
      success(result) {
        var data = JSON.parse(result.data)
        if (data.code == 1) {
          that.setData({
            businessImg: app.globalData.static + data.data
          })
        } else {
          that.toast(data.msg)
        }
      },
      fail: function () {
        that.toast('网络错误，上传失败')
      }
    })
  },

  // 上传营业执照
  upload: function (e) {
    var that = this
    var type = e.currentTarget.dataset.type
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success(res) {
        if(type == 1){
          that.requestAvatar(res)
        } else if (type == 2){
          that.setData({
            flag: false
          })
          that.requestBusiness(res)
        }
      }
    })
  },

  // 提交
  formSubmit:function(e){
    var that = this
    var val = e.detail.value;
    var formid = e.detail.formId;
    var logo = that.data.imgUrl
    if (logo == '/images/avator.png'){
      that.toast('请上传公司logo')
      return 
    } else if (val.name == ''){
      that.toast('请输入公司全称')
      return
    } else if(val.abbr == ''){
      that.toast('请输入公司简称')
      return
    } else if (val.master == '') {
      that.toast('请输入联系人')
      return
    } else if (that.data.ctel == '') {
      that.toast('请获取联系电话')
      return
    } else if (that.data.region == ''){
      that.toast('请选择联系地址')
      return 
    } else if (val.address == ''){
      that.toast('请输入详细地址')
      return 
    } else if (that.data.businessImg == ''){
      that.toast('请上传营业执照')
      return 
    } else{
      wx.request({
        url: app.globalData.https + 'Company/myJoin',
        method:'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data:{
          token: app.globalData.token,
          id: that.data.id,
          cname:val.name,
          store_name: val.abbr,
          ctel: val.ctel,
          caddr:val.address,
          cmaster:val.master,
          yyzz: that.data.businessImg,
          logo: that.data.imgUrl,
          province_id: that.data.region[0],
          city_id: that.data.region[1],
          region_id: that.data.region[2]
        },
        success: res => {
          if (res.data.code == 1) {
            paySuccess.paySuccess(app.globalData.https + 'Pushs/getFormID', 'post', { token: app.globalData.token, formid: formid, type: 1 })
            wx.showToast({
              title: res.data.msg
            })
            setTimeout(function(){
              wx.navigateBack()
            },2000)
          } else if (res.data.code == 0) {
            that.toast(res.data.msg)
          }
        }
      })
      return
    }
  },

  onLoad: function (options) {
    var that = this
    wx.request({
      url: app.globalData.https + 'Company/myJoinPage',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 1) {
          if (res.data.data.zt == 1) {
            that.setData({
              zt: res.data.data.zt
            })
          } else if (res.data.data.zt == 0) {
            that.setData({
              zt: res.data.data.zt,
              status: res.data.data.status
            })
          }
        } else {
          that.toast(res.data.msg)
        }
      },
      fail: function () {
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        })
        wx.navigateBack()
      }
    })
  },

  onShow: function () {
    
  }
})
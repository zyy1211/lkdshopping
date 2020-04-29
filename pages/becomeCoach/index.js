const paySuccess = require('../../utils/util.js');
const app = getApp()
Page({
  data: {
    imgUrl: '',
    sexLists: ['男', '女'],
    sex: '男',
    data: {},     // 选择的场馆
    lists: [],
    front: true,
    back: true,
    frontImg: '',
    backImg: '',
    zt: '',
    status: {},
    nickName: '',
    phone: '',
    sfz_code: '',
    coach_id: ''
  },

  // 提示框
  toast:function( msg ){
    wx.showToast({
      title: msg,
      icon: 'none'
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
            phone: res.data.data.phone
          })
        }
      }
    })
  },

  // 重新提交
  resub:function(){
    var that = this
    that.setData({
      zt: 1
    })
    wx.request({
      url: app.globalData.https + 'Company/getCoachJoinDetail',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: { token: app.globalData.token },
      success: function (res) {
        if (res.data.code == 1) {
          var data = res.data.data
          var gender = data.gender
          var sex = ''
          if(gender == '0'){
            sex = '女'
          }else {
            sex = '男'
          }
          that.setData({
            data: data.cg,
            sex: sex,
            imgUrl: data.avatarurl,
            frontImg: data.sfz_zm,
            backImg: data.sfz_fm,
            front: false,
            back: false,
            nickName: data.nickname,
            phone: data.phone,
            sfz_code: data.sfz_code,
            coach_id: data.coach_id
          })
        }
      }
    })
  },

  // 头像接口
  requestAvatar:function(res){
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
        }else{
          that.toast(data.msg)
        }
      }
    })
  },  

  // 身份证接口
  requestIdcard: function (type,res) {
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
          if (type == 2){
            that.setData({
              frontImg: app.globalData.static + data.data
            })
          } else if (type == 3){
            that.setData({
              backImg: app.globalData.static + data.data
            })
          }
        } else {
          that.toast(data.msg)
        }
      },
      fail:function(){
        that.toast('网络错误，上传失败')
      }
    })
  },

  // 上传头像或身份证
  upload: function (e) {
    var that = this
    var type = e.currentTarget.dataset.type
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success(res) {
        if (type == 1) {
          that.requestAvatar(res)
        } else if (type == 2) {
          that.setData({
            front: false
          })
          that.requestIdcard(type,res)
        }else if(type == 3){
          that.setData({
            back: false
          })
          that.requestIdcard(type,res)
        }
      }
    })
  },

  // 跳转到选择场馆
  toVenue:function(){
    var lists = this.data.lists
    wx.navigateTo({
      url: '/pages/venue/index?lists=' + JSON.stringify(lists)
    })
  },

  //切换选择性别
  tapSex: function (e) {
    this.setData({
      sex: e.currentTarget.dataset.sex
    })
  },

  //  提交
  formSubmit: function (e) {
    var that = this
    var venue = that.data.val
    var formid = e.detail.formId;
    var val = e.detail.value;
    var code = /^([1-9]{2}\d{15})(\d|[x,X])$/.test(val.idcode); 
    var sex = that.data.sex;
    if (sex == '男'){
      var gender = 1;
    } if (sex == '女'){
      var gender = 0;
    }
    if (val.name == '') {
      that.toast('请输入真实姓名')
      return
    } else if (venue == ''){
      that.toast('请选择所属场馆')
      return
    } else if (!code) {
      that.toast('身份证格式错误')
      return
    } else {
      wx.request({
        url: app.globalData.https + 'Company/coachJoin',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          token: app.globalData.token,
          coach_id: that.data.coach_id,
          nickName: val.name,
          phone: that.data.phone,
          avatarUrl: that.data.imgUrl,
          sfz_code: val.idcode,
          gender: gender,
          sfz_zm: that.data.frontImg,
          sfz_fm: that.data.backImg,
          place_id: that.data.data.id,
          store_uid: that.data.data.store_uid
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
          } else if (res.data.code == 0){
            that.toast(res.data.msg)
          }
        }
      })
      return
    }
  },

  onLoad: function (options) {
    var that = this
    that.setData({
      imgUrl: app.globalData.userInfo.avatarurl
    })
    wx.request({
      url: app.globalData.https + 'Company/coachJoinPage',
      method: 'POST',
      header: {'content-type': 'application/x-www-form-urlencoded'},
      data: {
        token: app.globalData.token
      },
      success:function(res){
        if(res.data.code == 1){
          if(res.data.data.zt == 1){
            that.setData({
              zt: res.data.data.zt,
              lists: res.data.data.lists
            })
          } else if (res.data.data.zt == 0){
            that.setData({
              zt: res.data.data.zt,
              status: res.data.data.status,
              lists: res.data.data.lists
            })
          }
        }else{
          that.toast(res.data.msg)
        }
      },
      fail:function(){
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
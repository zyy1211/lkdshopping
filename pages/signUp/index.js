// pages/becomeCoach/index.js
const app = getApp()
Page({
  data: {
    imgUrl: '',
    sexLists: ['男', '女'],
    sex: '男',
    region: [],
    array: [],      // region 里面的 name 属性用于 picker 显示
    contest_id: '',
    index: null
  },

  // 提示框
  toast:function( msg ){
    wx.showToast({
      title: msg,
      icon: 'none'
    })
  },

  //选择赛事
  bindRegionChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  }, 

  // 上传头像
  upload: function (e) {
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
            if (data.code == 1) {
              that.setData({
                imgUrl: app.globalData.static + data.data
              })
            } else {
              that.toast(data.msg)
            }
          }
        })
      }
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
    var val = e.detail.value;
    var flag = /^1[3456789]\d{9}$/.test(val.tel);
    var code = /^([1-9]{2}\d{15})(\d|[x,X])$/.test(val.idcode); 
    var index = that.data.index
    var sex = that.data.sex;
    if (sex == '男'){
      var gender = 1;
    } if (sex == '女'){
      var gender = 0;
    }
    if (val.name == '') {
      that.toast('请输入真实姓名')
      return
    }else if (!flag) {
      that.toast('电话号码不正确')
      return
    }else if (!code) {
      that.toast('身份证格式错误')
      return
    }else if(val.item == ''){
      that.toast('请选择参赛项目')
      return
    }else {
      wx.request({
        url: app.globalData.https + 'News/joinContest',
        method: 'POST',
        header: {'content-type': 'application/x-www-form-urlencoded'},
        data: {
          token: app.globalData.token,
          contest_id: that.data.contest_id,
          truename: val.name,
          phone: val.tel,
          avatarurl: that.data.imgUrl,
          sfz_code: val.idcode,
          gender: gender,
          item_id: that.data.region[index].id
        },
        success: res => {
          if (res.data.code == 1) {
            wx.navigateBack()
            wx.showToast({
              title: res.data.msg
            })
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
      imgUrl: app.globalData.userInfo.avatarurl,
      contest_id: options.contest_id
    })
    wx.request({
      url: app.globalData.https + 'News/getContestItem',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        contest_id: options.contest_id
      },
      success: function(res) {
        if(res.data.code == 1){
          var data = res.data.data
          var arr = []
          for (var i = 0; i < data.length;i++){
            arr.push( data[i].name )
          }
          that.setData({
            region: data,
            array: arr
          })
        }else{
          that.toast(res.data.msg)
        }
      },
      fail:function(){
        that.toast('网络错误，请重进')
      }
    })
  },

  onShow: function () {

  }
})

const app = getApp()
Page({
  data: {
    signup: {},
    enrollessLists: []
  },

  // 弹出提示框
  toast:function(msg){
    wx.showToast({
      title: msg,
      icon: 'none'
    })
  },

  // 立刻修改
  modify:function(){
    var lists = this.data.enrollessLists
    if (lists.length < 2) {
      this.toast('请至少添加2位参赛选手')
      return
    }
    var type = this.data.signup.type
    var aid = this.data.signup.aid
    var signup_id = this.data.signup.signup_id
    var item_id = this.data.signup.item_id
    var arrObj = []
    for(var i=0;i<lists.length;i++){
      var flag = /^1[3456789]\d{9}$/.test(lists[i].phone);
      var code = /^([1-9]{2}\d{15})(\d|[x,X])$/.test(lists[i].sfz_code); 
      if (lists[i].name == ''){
        this.toast('姓名长度不正确')
        return
      } else if (!flag){
        this.toast('手机号不正确')
        return
      } else if (lists[i].gender == ''){
        this.toast('请选择性别')
        return
      } else if (lists[i].clothing_size == ''){
        this.toast('请选择尺码')
        return
      } else if (!code) {
        this.toast('身份证格式错误')
        return
      } else{
        var data = {
          id: lists[i].id, name: lists[i].name, phone: lists[i].phone, gender: lists[i].gender, clothing_size: lists[i].clothing_size, sfz_code: lists[i].sfz_code
        }
        arrObj.push(data)
      }
    }
    arrObj.unshift({ aid: aid, token: app.globalData.token, type: type, signup_id: signup_id, item_id: item_id})
    var that = this
    wx.request({
      url: app.globalData.https + 'Active/editSignup',
      method: 'POST',
      header: { 'content-type':'application/x-www-form-urlencoded'},
      data: JSON.stringify(arrObj),
      success:function(res){
        if(res.data.code == 1){
          setTimeout(function(){
            wx.navigateBack()
          },2000)
        }
        that.toast(res.data.msg)
      }
    })
  },

  // 将填写的信息同步到数组里面
  setValue:function(e){
    var type = e.currentTarget.dataset.type
    var idx = e.currentTarget.dataset.idx
    if (type == 'name'){
      var name = e.detail.value
      this.setData({
        ['enrollessLists[' + idx + '].name']: name
      })
    } else if (type == 'phone'){
      var phone = e.detail.value
      this.setData({
        ['enrollessLists[' + idx + '].phone']: phone
      })
    } else if (type == 'gender'){
      var gender = e.currentTarget.dataset.gender
      this.setData({
        ['enrollessLists[' + idx + '].gender']: gender
      })
    }else if (type == 'size') {
      var size = e.currentTarget.dataset.size
      this.setData({
        ['enrollessLists[' + idx + '].clothing_size']: size
      })
    } else if (type == 'idcode') {
      var code = e.detail.value
      this.setData({
        ['enrollessLists[' + idx + '].sfz_code']: code
      })
    }
  },

  // 下拉框
  drawMenu:function(e){
    var type = e.currentTarget.dataset.type
    var i = e.currentTarget.dataset.idx
    var lists = this.data.enrollessLists
    if (type == 'size') {
      this.setData({
        ['enrollessLists[' + i + '].issize']: !lists[i].issize
      })
    }
  },

  // 增加人员信息
  increase:function(){
    var lists = this.data.enrollessLists
    var data = {
      name: '', phone: '', gender: '', clothing_size: '', sizeArr: ['S', 'M', 'L','XL','2XL','3XL'], sfz_code: '', issize: false
    }
    var type = this.data.signup.type
    if ( lists.length >= 4) {
      this.toast('至多四人报名')
      return
    }
    lists.push(data)
    this.setData({
      enrollessLists: lists
    })
  },

  // 删除人员信息
  descrease:function(e){
    var lists = this.data.enrollessLists
    var i = e.currentTarget.dataset.idx
    if(lists.length <= 1){
      this.toast('至少一人报名')
      return
    }
    lists.splice(i, 1)
    this.setData({
      enrollessLists: lists
    })
  },

  // 页面信息接口
  infoData: function () {
    var that = this
    wx.request({
      url: app.globalData.https + 'Active/mySignupDetail',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        signup_id: that.data.signup_id
      },
      success: function (res) {
        if (res.data.code == 1) {
          var arr = res.data.data.palyers
          for(var i = 0;i<arr.length;i++){
            arr[i].sizeArr = ['S', 'M', 'L', 'XL', '2XL', '3XL']
          }
          that.setData({
            enrollessLists: arr,
            active: res.data.data.active,
            signup: res.data.data.signup
          })
        } else {
          that.toast(res.data.msg)
        }
      },
      fail: function () {
        that.toast('网络错误')
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      signup_id: options.signup_id
    })
    this.infoData()
  },

  onShow: function () {

  }
})
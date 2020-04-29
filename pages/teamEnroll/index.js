const paySuccess = require('../../utils/util.js');
const app = getApp()
Page({
  data: {
    aid: '',
    ispay: false,
    teamData: {     // 团队信息
      teamTitle: '', teamLeader: '', leaderTel: '', leaderGender: '', leaderIdcode: '', isTeamsize: false, isTeamcate: false, cateVal: '', sizeVal: '',
      teamCate: ['A', 'B', 'C'],
      teamSize: ['S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    currIndex: 0,
    itemLists: [],
    enrollessLists: [{
      name: '', phone: '', gender: '', size: '', idcard: '', issize: false,
      sizeArr: ['S', 'M', 'L','XL', '2XL', '3XL']
    }],
    price: '140.00',
    end_time: '',
    type: ''
  },

  // 团队信息同步到 teamData 
  teamEvent:function(e){
    var type = e.currentTarget.dataset.type
    if (type == 'title'){
      var title = e.detail.value
      this.setData({
        ['teamData.teamTitle']: title
      })
    } else if (type == 'teamCate') {
      var cate = e.currentTarget.dataset.teamcate
      this.setData({
        ['teamData.cateVal']: cate
      })
    }else if (type == 'name') {
      var name = e.detail.value
      this.setData({
        ['teamData.teamLeader']: name
      })
    } else if (type == 'phone') {
      var phone = e.detail.value
      this.setData({
        ['teamData.leaderTel']: phone
      })
    } else if (type == 'gender') {
      var gender = e.currentTarget.dataset.gender
      this.setData({
        ['teamData.leaderGender']: gender
      })
    } else if (type == 'teamSize') {
      var size = e.currentTarget.dataset.teamsize
      this.setData({
        ['teamData.sizeVal']: size
      })
    } else if (type == 'idcode') {
      var code = e.detail.value
      this.setData({
        ['teamData.leaderIdcode']: code
      })
    } 
  },

  // 弹出提示框
  toast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none'
    })
  },

  // 立刻报名
  signUp: function () {
    var lists = this.data.enrollessLists
    if(lists.length<5){
      this.toast('至少六个人报名')
      return
    }else if(lists.length >= 13){
      this.toast('至多十四个人报名')
      return
    }
    var currIndex = this.data.currIndex
    var itemStr = this.data.itemLists[currIndex].id
    var type = this.data.type
    var data = this.data.teamData
    var flag = /^1[3456789]\d{9}$/.test(data.leaderTel);
    var code = /^([1-9]{2}\d{15})(\d|[x,X])$/.test(data.leaderIdcode);
    if (data.teamTitle == '' || data.teamTitle.length > 10){
      this.toast('队名长度不正确')
      return
    } else if (data.cateVal == ''){
      this.toast('请选择团队组别')
      return
    } else if (data.teamLeader == ''){
      this.toast('领队姓名不能为空')
      return
    } else if (!flag){
      this.toast('手机号不正确')
      return
    } else if (data.leaderGender == ''){
      this.toast('请选择性别')
      return
    } else if (data.sizeVal == ''){
      this.toast('请选择尺寸')
      return
    } else if (!code){
      this.toast('身份证格式错误')
      return
    }

    var arrObj = []
    for (var i = 0; i < lists.length; i++) {
      var flag = /^1[3456789]\d{9}$/.test(lists[i].phone);
      var code = /^([1-9]{2}\d{15})(\d|[x,X])$/.test(lists[i].idcard);
      if (lists[i].name == '') {
        this.toast('姓名长度不正确')
        return
      } else if (!flag) {
        this.toast('手机号不正确')
        return
      } else if (lists[i].gender == '') {
        this.toast('请选择性别')
        return
      } else if (lists[i].size == '') {
        this.toast('请选择尺码')
        return
      } else if (!code) {
        this.toast('身份证格式错误')
        return
      } else {
        var datas = {
          name: lists[i].name, phone: lists[i].phone, gender: lists[i].gender, clothing_size: lists[i].size, sfz_code: lists[i].idcard
        }
        arrObj.push(datas)
      }
    }
    var tData = { 
      name: data.teamLeader, phone: data.leaderTel, gender: data.leaderGender, clothing_size: data.sizeVal, sfz_code:data.leaderIdcode
    }
    
    arrObj.unshift(tData)
    arrObj.unshift({ aid: this.data.aid, item_id: itemStr, token: app.globalData.token, type: type, teamname: data.teamTitle, group_name: data.cateVal})
    var that = this
    wx.request({
      url: app.globalData.https + 'Active/addSignup',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: JSON.stringify(arrObj),
      success: function (res) {
        if (res.data.code == 1) {
          var order_id = res.data.data.order_id
          that.wxPay(res.data.data.payment, order_id)
        } else {
          that.toast(res.data.msg)
        }
      }
    })
  },

  //微信支付
  wxPay: function (payment,signup_id) {
    var that = this
    wx.requestPayment({
      timeStamp: payment.timeStamp,
      nonceStr: payment.nonceStr,
      package: 'prepay_id=' + payment.prepay_id,
      signType: 'MD5',
      paySign: payment.paySign,
      success(res) {
        wx.showToast({
          title: '报名成功！'
        })
        paySuccess.paySuccess(app.globalData.https + 'Pushs/getFormID', 'post', { token: app.globalData.token, formid: payment.prepay_id, type: 0 })
      },
      fail() {
        that.toast('费用未支付')
      },
      complete(){
        wx.redirectTo({
          url: '/pages/enrollDetail/index?signup_id=' + signup_id
        })
      }
    })
  },

  // 将填写的信息同步到数组里面
  setValue: function (e) {
    var type = e.currentTarget.dataset.type
    var idx = e.currentTarget.dataset.idx
    if (type == 'name') {
      var name = e.detail.value
      this.setData({
        ['enrollessLists[' + idx + '].name']: name
      })
    } else if (type == 'phone') {
      var phone = e.detail.value
      this.setData({
        ['enrollessLists[' + idx + '].phone']: phone
      })
    } else if (type == 'gender') {
      var gender = e.currentTarget.dataset.gender
      this.setData({
        ['enrollessLists[' + idx + '].gender']: gender
      })
    } else if (type == 'size') {
      var size = e.currentTarget.dataset.size
      this.setData({
        ['enrollessLists[' + idx + '].size']: size
      })
    } else if (type == 'idcode') {
      var code = e.detail.value
      this.setData({
        ['enrollessLists[' + idx + '].idcard']: code
      })
    }
  },

  // 下拉框
  drawMenu: function (e) {
    var type = e.currentTarget.dataset.type
    var lists = this.data.enrollessLists
    var teamData = this.data.teamData
    if (type == 'size') {
      var i = e.currentTarget.dataset.idx
      this.setData({
        ['enrollessLists[' + i + '].issize']: !lists[i].issize
      })
    } else if (type == 'teamCate') {
      this.setData({
        ['teamData.isTeamcate']: !teamData.isTeamcate
      })
    } else if (type == 'teamSize') {
      this.setData({
        ['teamData.isTeamsize']: !teamData.isTeamsize
      })
    }
  },

  // 增加人员信息
  increase: function () {
    var lists = this.data.enrollessLists
    var data = {
      name: '', phone: '', gender: '', size: '', idcard: '', issize: false,
      sizeArr: ['S', 'M', 'L','XL','2XL','3XL']
    }
    if (lists.length >= 13) {
      this.toast('至多十四个人报名')
      return
    }
    lists.push(data)
    this.setData({
      enrollessLists: lists
    })
  },

  // 删除人员信息
  descrease: function (e) {
    var lists = this.data.enrollessLists
    var i = e.currentTarget.dataset.idx
    if (lists.length <= 6) {
      this.toast('至少六个人报名')
      return
    }
    lists.splice(i, 1)
    this.setData({
      enrollessLists: lists
    })
  },

  // 勾选项目
  checked: function (e) {
    var index = e.currentTarget.dataset.index
    this.setData({
      currIndex: index
    })
  },

  onLoad: function (options) {
    var that = this
    that.setData({
      type: options.type,
      end_time: options.end_time,
      aid: options.aid,
      price: options.price_team
    })
    wx.request({
      url: app.globalData.https + 'Active/getItemLists',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        aid: options.aid,
        type: options.type
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            itemLists: res.data.data
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

  onShow: function () {

  }
})
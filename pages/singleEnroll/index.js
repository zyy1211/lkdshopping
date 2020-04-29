const paySuccess = require('../../utils/util.js');
const app = getApp()
Page({
  data: {
    aid: '',
    type: '',
    ispay: false,
    itemLists:[],
    enrollessLists:[
      { name: '', phone: '', gender: '', size: '', idcard: '', issize: false,
        sizeArr: ['S', 'M', 'L','XL','2XL','3XL']
      },
      { name: '', phone: '', gender: '', size: '', idcard: '', issize: false,
        sizeArr: ['S', 'M', 'L','XL','2XL','3XL']
      }
    ],
    price: 200,
    allprice: '0.00',
    end_time: '',
    arrLists: [],
    currIndex: null
  },

  // 勾选项目
  checked: function (e) {
    var i = e.currentTarget.dataset.index
    var price = this.data.price
    this.setData({
      currIndex: i,
      allprice: (price * 1).toFixed(2)
    })

    /* var arr = this.data.arrLists
    var lists = this.data.itemLists
    if (!lists[i].ischeck || lists[i].ischeck == 'undefined'){
      if (arr.length >= 1) {
        this.toast('最多选1个项目')
        return
      }else{
        arr.push('1')
      }
    }else{
      arr.splice(arr.length-1,1)
    }
    this.setData({
      arrLists: arr,
      ['itemLists[' + i + '].ischeck']: !lists[i].ischeck,
      allprice: (arr.length * price).toFixed(2)
    }) */
  },

  // 弹出提示框
  toast:function(msg){
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
  },

  // 立刻报名
  signUp:function(){
    /* var array = this.data.itemLists
    var arr2 = []
    for(var j=0;j<array.length;j++){
      if(array[j].ischeck){
        arr2.push(array[j].id)
      }
    } */
    var lists = this.data.enrollessLists
    var itemLists = this.data.itemLists
    var currIndex = this.data.currIndex
    if (currIndex == null){
      this.toast('  请选择参赛项目')
      return
    }
    var itemStr = itemLists[currIndex].id
    /* var itemStr = arr2.join(',')
    if(arr2 == ''){
      this.toast('请选择参赛项目')
      return
    } */
    if (lists.length < 2){
      this.toast('请至少添加2位参赛选手')
      return
    }
    var type = this.data.type
    var arrObj = []
    for(var i=0;i<lists.length;i++){
      var flag = /^1[3456789]\d{9}$/.test(lists[i].phone);
      var code = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/; 
      if (lists[i].name == ''){
        this.toast('姓名长度不正确')
        return
      } else if (!flag){
        this.toast('手机号不正确')
        return
      } else if (lists[i].gender == ''){
        this.toast('请选择性别')
        return
      } else if (lists[i].size == ''){
        this.toast('请选择尺码')
        return
      } else if (!code) {          
        this.toast('身份证格式错误')
        return
      } else{
        var data = {
          name: lists[i].name, phone: lists[i].phone, gender: lists[i].gender, clothing_size: lists[i].size, sfz_code: lists[i].idcard
        }
        arrObj.push(data)
      }
    }
    arrObj.unshift({ aid: this.data.aid, item_id: itemStr, token: app.globalData.token, type: type })
    var that = this
    wx.request({
      url: app.globalData.https + 'Active/addSignup',
      method: 'POST',
      header: { 'content-type':'application/x-www-form-urlencoded'},
      data: JSON.stringify(arrObj),
      success:function(res){
        if(res.data.code == 1){
          var order_id = res.data.data.order_id
          that.wxPay(res.data.data.payment, order_id)
        }else{
          that.toast(res.data.msg)
        }
      }
    })
  },

  //微信支付
  wxPay: function (payment, signup_id) {
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
      complete() {
        setTimeout(function(){
          wx.redirectTo({
            url: '/pages/enrollDetail/index?signup_id=' + signup_id
          })
        },2000)
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
      name: '', phone: '', gender: '', size: '', sizeArr: ['S', 'M', 'L','XL','2XL','3XL'], idcard: '', issize: false
    }
    if (lists.length >= 2) {
      this.toast('一组最多添加2位参赛选手')
      return
    }
    lists.push(data)
    this.setData({
      enrollessLists: lists
    })
  },

  // 删除人员信息
  descrease:function(e){
    var that = this
    var lists = that.data.enrollessLists
    var i = e.currentTarget.dataset.idx
    if(lists.length <= 1){
      that.toast('请至少添加2位参赛选手')
      return
    }
    wx.showModal({
      title: '友情提示',
      content: '确定删除该人员信息吗？',
      success: function (res){
        if (res.confirm){
          lists.splice(i, 1)
          that.setData({
            enrollessLists: lists
          })
        }
      }
    })
  },

  onLoad: function (options) {
    var that = this
    that.setData({
      type: options.type,
      end_time: options.end_time,
      aid: options.aid,
      price: options.price_single
    })
    wx.request({
      url: app.globalData.https + 'Active/getItemLists',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        aid: options.aid,
        type: options.type
      },
      success: function (res){
        if(res.data.code ==1){
          that.setData({
            itemLists: res.data.data
          })
        }else{
          that.toast(res.data.msg)
        }
      },
      fail:function(){
        that.toast('网络错误')
      }
    })
  },

  onShow: function () {

  }
})
// pages/productDetail/index.js
const app = getApp()
const phoneNumber = require('../../utils/util.js');
Page({
  data: {
    telModialog: false,
    isRequest: true,        // ture 需要请求，false不需要
    isshare: 0,     // 0, 表示不是从分享进入, 1 表示是从分享进入
    isFlag: false,
    isDropdown:true,
    static: app.globalData.static,
    currIndex: 1,
    tap_index: 1,
    isGroy: true,
    spec_list_form: {},
    spec_list: [],
    spec_attr: [],
    sales_initial: 0,
    goods_id: 0,
    goods_title: '',
    type: '',
    goods_num: 1,
    proContent:'',
    aftersales: '',
    imgUrls: [],
    stock_num:0,
    evaluation: [],
    sku_id: '',
    cartNum: '',
    showCartNum: false,
    loadMore: true,
    store: {},
    pagenum: 1,
    share:{},
    goods_jldw: '',
    isban: false
  },

  // 关闭获取电话号码模态框
  closeTelModia:function(){
    this.setData({
      telModialog: false
    })
  },

  // 登录检测
  login: function () {
    var token = app.globalData.token
    if (token == '') {
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

  //立即购买
  toPay: function () {
    this.setData({
      isban: true
    })
    this.login()
    var goodsInfo = JSON.stringify({
      goods_id: this.data.goods_id,
      goods_num: this.data.goods_num,
      goods_sku_id: this.data.sku_id,
      goods_id: this.data.goods_id,
    })
    var that = this
    setTimeout(function(){
      var isRequest = that.data.isRequest
      if (!isRequest) {
        wx.navigateTo({
          url: '/pages/pay/index?order_type=1' + '&goodsInfo=' + goodsInfo
        })
        that.setData({
          isban: false
        })
      }
    },200)
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
          telModialog: true,
          isRequest: true
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
          isRequest: false,
          isban: false
        })
      } else {
        console.log(132)
        that.setData({
          telModialog: true,
          isRequest: true,
          isban: false
        })
      }
    })
  },

  // 生成海报
  createPoster:function(){
    this.setData({ 
      isFlag: !this.data.isFlag
    })
    this.selectComponent('#getPoster').getAvaterInfo();
  },

  // 跳转到商家详情
  toBusinDetail:function(){
    var store_id = this.data.store.store_id
    wx.navigateTo({
      url: '/pages/businessesDetail/index?store_id=' + store_id
    })
  },

  //下拉选择规格
  dropDown:function(){
    this.setData({
      isDropdown: !this.data.isDropdown
    })
  },

  // 切换遮罩层
  tapmMask: function () {
    this.setData({
      isFlag: !this.data.isFlag
    })
  },

  //跳转到购物车页面
  toCarLists:function(){
    wx.navigateTo({
      url: '/pages/carLists/index',
    })
  },
  
  //加入到购物车
  addCarLists:function(){
    var that=this
    var data = that.data
    that.login()
    if(data.type == '1'){
      wx.showToast({
        title: '积分商品不能加入购物车',
        icon: 'none'
      })
      return
    }
    setTimeout(function () {
      var isRequest = that.data.isRequest
      if (!isRequest) {
        wx.request({
          url: app.globalData.https + 'Cart/add',
          method: 'POST',
          data: {
            token: app.globalData.token,
            goods_id: data.goods_id,
            goods_num: data.goods_num,
            goods_sku_id: data.sku_id
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success:function(res){
            if(res.data.code == 1){
              wx.showToast({
                title: res.data.msg
              })
              that.setData({
                cartNum: res.data.data.cart_total_num,
                showCartNum: true
              })
            }else if(res.data.code == 0){
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            }
          }
        })
      }
    },200)
  },

  // 增加商品数量
  up:function() {
    var num = this.data.goods_num + 1
    this.setData({
      goods_num: num
    })
  },

  // 减少商品数量
  down:function() {
    var num = this.data.goods_num - 1
    if (this.data.goods_num > 1) {
      this.setData({
        goods_num: num
      });
    }
  },

  gepic: function () {
    var that = this;
    for (var i in that.data.spec_list) {
      if (that.data.sku_id == that.data.spec_list[i].spec_sku_id) {
        that.setData({
          spec_list_form: that.data.spec_list[i].form
        })
      }
    }
  },

  // 点击切换不同规格
  select: function (e) {
    var that=this;
    var idx = e.currentTarget.dataset.attr_id;
    var ind = e.currentTarget.dataset.item_id;
    var sku_id = '';
    var list = that.data.spec_attr;
    for (var j in list[idx].spec_items) {
      if ( j == ind) {
        list[idx].spec_items[j].ischecked = true
      } else {
        list[idx].spec_items[j].ischecked = false
      }
    }
    for (var i in list) {
      for (var j in list[i].spec_items) {
        if (list[i].spec_items[j].ischecked) {
          sku_id += list[i].spec_items[j].item_id + '_';
        } 
      }
    }
    that.setData({
      sku_id: sku_id.substr(0, sku_id.length - 1),
      spec_attr: list,
      goods_num:1
    },() => {
      that.gepic();
    });
  },

  //显示商品详情,商品评价,物流与售后
  showDetail: function (e) {
    var tap_index = e.currentTarget.dataset.tap_index
    this.setData({
      tap_index: tap_index
    })
  },

  //显示当前轮播图的索引值
  currentIndex: function (e) {
    if (e.detail.source == 'touch') {
      this.setData({
        currIndex: e.detail.current + 1
      })
    }
  },

  //点击预览轮播图图片
  previewImage: function (e) {
    var index = e.currentTarget.dataset.index;
    var imgList = this.data.imgUrls
    var arr = []
    for (var i = 0, len = imgList.length;i < len; i++ ){
      var list = this.data.static + imgList[i].save_path + imgList[i].file_name
      arr.push(list)
    }
    wx.previewImage({
      current: arr[index],      // 当前显示图片的http链接
      urls: arr,         // 需要预览的图片http链接列表
    })
  },

  //请求页面数据
  pageInfo: function () {
    var that = this
    wx.request({
      url: app.globalData.https + 'Goods/getGoodsDetail',
      method: 'POST',
      data: {
        goods_id: that.data.goods_id,
        p: 1    
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var data = res.data.data;
        console.log(res.data.data)
        if (res.data.code == 1) {
          that.setData({
            imgUrls: data.detail.images,
            sales_initial: data.detail.sales_initial,
            goods_title: data.detail.goods_name,
            proContent: data.detail.content.replace(/\<img/gi ,'<img class="rich-img" '),
            aftersales: data.detail.aftersales.replace(/\<img/gi ,'<img class="rich-img" '),
            evaluation: data.evaluation,
            store: data.detail.store,
            share: data.detail.share,
            type: data.detail.type,
            goods_jldw: data.detail.goods_jldw
          })
          if (data.detail.spec_type == 10) {
            that.setData({
              spec_list_form: data.detail.spec,
              isGroy: false
            })
          } else if (data.detail.spec_type == 20) {
            var sku_id = ''
            for (var i in data.specData.spec_attr) {
              for (var j in data.specData.spec_attr[i].spec_items) {
                if (j == 0) {
                  sku_id += data.specData.spec_attr[i].spec_items[j].item_id + '_';
                  data.specData.spec_attr[i].spec_items[j].ischecked =true
                } else {
                  data.specData.spec_attr[i].spec_items[j].ischecked = false
                }
              }
            }
            that.setData({
              sku_id: sku_id.substr(0, sku_id.length - 1),
              spec_list: data.specData.spec_list,
              spec_list_form: data.specData.spec_list[0].form,
              spec_attr: data.specData.spec_attr,
              isGroy: true
            }, () => {
              that.gepic()
            })
          }
        }
      },
      fail:function(){
        wx.showModal({
          title: '友情提示',
          content: '网络错误，请重新进入',
          showCancel: false,
          success:function(res){
            if(res.confirm){
              wx.navigateBack()
            }
          }
        })
      }
    })
  },

  onLoad: function (options) {
    console.log('fs');
    this.setData({
      goods_id: options.goods_id
    })
    if (options.isshare == 1) {
      this.setData({
        isshare: options.isshare
      })
    }
  },

  onShow: function () {
    this.setData({
      goods_num: 1,
      showCartNum: false,
      isban: false
    })
    this.pageInfo();
  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {
    var that = this
    var tap_index = that.data.tap_index
    if ( tap_index == 1 || tap_index == 2 ){
      return
    }
    var loadMore = that.data.loadMore
    if( !loadMore ){
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
      return
    }
    var p = that.data.pagenum + 1
    that.setData({
      pagenum: p
    })
    wx.request({
      url: app.globalData.https + 'Goods/getGoodsDetail',
      method: 'POST',
      data: {
        goods_id: that.data.goods_id,
        p: p
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res){
        var arr1 = that.data.evaluation
        var arr2 = res.data.data.evaluation
        if (res.data.code == 1 && arr2 != ''){
          var arr3 = arr1.concat(arr2)
          that.setData({
            evaluation: arr3
          })
        }
        if (arr2 == '') {
          that.setData({
            loadMore: false
          })
        }
      }
    })
  },

  // 回到首页(分享的时候)
  backHome: function () {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },

  onShareAppMessage: function (e) {
    var img = this.data.share.img
    var title = this.data.goods_title
    return {
      title: title,
      path: '/pages/productDetail/index?isshare=1&goods_id=' + this.data.goods_id,
      imageUrl: img
    }
  }
})
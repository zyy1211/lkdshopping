//获取应用实例
const app = getApp();

Page({
  data: {
    idx: 0,
    static: app.globalData.static,
    category: 'Category/1x/',
    autoplay: true,
    swiperIndex: 0,
    imgUrls: [],
    proLists: [],
    lists: [],
    msg: [],
    dete: [],
    share: {},
    banner: ''
  },

  //  跳转到搜索页面
  toSearch: function () {
    wx.navigateTo({
      url: '/pages/search/index'
    })
  },

  // 网络错误弹框
  networkError: function () {
    wx.showModal({
      title: '友情提示',
      content: '网络错误，请下拉刷新',
      showCancel: false
    })
  },

  // banner 公告 球类列表
  indexInfo: function () {
    var that = this
    wx.request({
      url: app.globalData.https + 'Index/getInfo',
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
        if (res.data.code == 1) {
          that.setData({
            imgUrls: res.data.data.bannerlists,
            lists: res.data.data.catelists,
            msg: res.data.data.newslists,
            share: res.data.data.share
          })
        }
      },
      fail: function () {
        that.networkError()
      }
    })
  },
  previewImage: function (e) {
    let self = this;
    let current = e.currentTarget.dataset.url;
    wx.previewImage({
      current:current,
      urls: self.data.bannerCode
    })
  },
  // 点击 banner 跳转
  bannerUrl: function (e) {
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: '/pages/webview/webview?url=' + url
    })
  },

  //关闭模态框
  closeMask: function () {
    this.setData({
      isMask: false
    })
  },
  //去商城
  toScList:function(){
    app.globalData.bannerUrl = "1";
    wx.switchTab({
      url: '../cateGory/index'
    })
  },
  // toScList2:function(){
  //   app.globalData.bannerUrl = "1";
  //   wx.switchTab({
  //     url: '../cateGory/index'
  //   })
  // },

  //跳转到商品详情
  toProDetail: function (e) {
    var goods_id = e.currentTarget.dataset.goods_id
    wx.navigateTo({
      url: '/pages/productDetail/index?goods_id=' + goods_id
    })
  },

  //跳转到商城
  toCateGory: function () {
    wx.reLaunch({
      url: '/pages/cateGory/index'
    })
  },

  //跳转到咨询中心
  toZXcenter: function () {
    wx.navigateTo({
      url: '/pages/zixunCenter/index',
    })
  },

  //跳转到咨询详情
  toZXdetail: function (e) {
    wx.navigateTo({
      url: '/pages/zixunDetail/index?newsid=' + e.currentTarget.dataset.id,
    })
  },

  //请求预约信息
  info: function () {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function () {},
      complete: function (res) {
        var latitude = 0,
          longitude = 0
        if (res.latitude) {
          latitude = res.latitude
          longitude = res.longitude
        }
        app.globalData.latitude = latitude
        app.globalData.longitude = longitude
        wx.request({
          url: app.globalData.https + 'Index/getReservation',
          method: 'POST',
          data: {
            lat: latitude,
            lon: longitude
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (result) {
            if (result.data.code == 1) {
              that.setData({
                dete: result.data.data
              })
              that.getLocation()
            }
          },
          fail: function () {
            that.networkError()
          }
        })
      }
    })
  },

  //预约详情
  toReserveDetail: function (e) {
    var title = e.currentTarget.dataset.title
    var id = e.currentTarget.dataset.id
    wx: wx.navigateTo({
      url: '/pages/reserveDetail/index?title=' + title + '&id=' + id
    })
  },

  //预约中心, 选择运动项目
  toReserveCenter: function (e) {
    var name = e.currentTarget.dataset.catename;
    var id = e.currentTarget.dataset.id;
    if (id != '0') {
      wx: wx.navigateTo({
        url: '/pages/reserveCenter/index?rsortid=1&catename=' + name + '&cateid=' + id
      })
    }
    else {
      wx: wx.navigateTo({
        url: '/pages/allBalls/index'
      })
    }
  },

  //签到
  sign: function () {
    var token = app.globalData.token
    if (token) {
      var isRequest = this.data.isRequest
      if (isRequest) {
        this.requestPhone()
      }
      wx.navigateTo({
        url: '/pages/sign/index'
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/index',
      })
    }
  },

  // 轮播滑动时，获取当前的轮播id
  swiperChange(e) {
    const that = this;
    that.setData({
      swiperIndex: e.detail.current
    })
  },

  // 器材专区，商品列表请求
  proLists: function () {
    var that = this
    wx.request({
      url: app.globalData.https + 'Index/productslist',
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            proLists: res.data.data
          })
        }
      },
      fail: function () {
        that.networkError()
      }
    })
  },

  // 获取地理位置接口
  getLocation: function () {
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            lang: 'zh_CN',
            success: function (res) {
              wx.request({
                url: app.globalData.https + 'Location/getUserLocation',
                method: 'post',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  province: res.userInfo.province,
                  city: res.userInfo.city
                }
              })
            }
          });
        }
      }
    })
  },

  onLoad: function () {
    let self = this;
    this.info()
    this.proLists()
    this.indexInfo();
    this.getBanner();
  },
  getBanner:function(){
    let self = this;
    wx.request({
      url: app.globalData.https + 'Goods/getGoodsDetail',
      method: 'POST',
      data: {
        goods_id: '10197',
        p: 1
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        let detail = res.data.data.detail;
        console.log(detail)
        let bannerSrc = [];
        let bannerCode = [];
        let imgReg = /<img.*?(?:>|\/>)/gi;
        let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
        let banSrc = detail.content.match(imgReg) || []; // banner src
        let banCode = detail.aftersales.match(imgReg) || []; // banner src
        for (var i = 0; i < banSrc.length; i++) {
          var src = banSrc[i].match(srcReg);
          bannerSrc.push(src[1])
        }
        for (var i = 0; i < banCode.length; i++) {
          var src = banCode[i].match(srcReg);
          bannerCode.push(src[1])
        }
        self.setData({
          bannerTo:detail.spec.goods_no.split(','),
          bannerSrc:bannerSrc,
          bannerCode:bannerCode,
          sales_initial:detail.sales_initial
        })
      },
    })
  },

  onShow: function () {

  },

  onPullDownRefresh: function () {
    this.info()
    this.proLists()
    this.indexInfo()
    wx.stopPullDownRefresh() // 停止下拉
  },

  onShareAppMessage: function () {
    var share = this.data.share
    return {
      title: share.title,
      path: '/pages/index/index',
      imageUrl: share.img
    }
  },
  navigateToPage:function(){
    app.globalData.bannerUrl = "1";
    wx.switchTab({
      url: '/pages/cateGory/index',
    })
  }
  // toMiniProgram:function(){
  //   wx.navigateToMiniProgram({
  //     appId: 'wx507b9c287ae6a263',
  //     path: 'pages/activityList/index',
  //     envVersion: 'develop',
  //     success(res) {
        
  //     }
  //   })
  // }
})
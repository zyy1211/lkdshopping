const app = getApp();
const https = app.globalData.https;
Page({
  data: {
    isShow:true,
    rsortid:1,
    allArea: '全部',
    others: '离我最近',
    catename: '全部',
    cateid: 0,
    areaid:0,
    otherid:0,
    pagenum: 1, //初始页默认值为1
    qy_drawMenu: false,
    ym_drawMenu: false,
    lw_drawMenu: false,
    qyList: [],
    ymList: [],
    httpImg: app.globalData.static,
    lwList: [],
    yuList:[],
    loadMore:true
  },

  // 预约详情
  toReserveDetail: function (e) {
    var title=e.currentTarget.dataset.title
    var id=e.currentTarget.dataset.id
    var rsortid = this.data.rsortid
    if (rsortid == '3'){
      wx: wx.navigateTo({
        url: '/pages/coach/index?&id=' + id
      })
    }else{
      wx: wx.navigateTo({
        url: '/pages/reserveDetail/index?title='+title+'&id='+id
      })
    }
  },

  //下拉框
  qyShow:function(){
    var that=this
    that.setData({
      qy_drawMenu: !that.data.qy_drawMenu,
      ym_drawMenu: false,
      lw_drawMenu: false
    })
  },
  ymShow:function(){
    var that=this
    that.setData({
      ym_drawMenu: !that.data.ym_drawMenu,
      qy_drawMenu: false,
      lw_drawMenu: false
    })
  },
  lwShow:function(){
    var that=this
    that.setData({
      lw_drawMenu: !that.data.lw_drawMenu,
      qy_drawMenu: false,
      ym_drawMenu: false
    })
  },

  //下拉框列表
  qyTap:function(e){
    this.setData({
      allArea: e.currentTarget.dataset.name,
      areaid: e.currentTarget.dataset.areaId,
      pagenum: 1,
      yuList: []
    })
    this.getdatalist()
  },
  ymTap:function(e){
    this.setData({
      catename: e.currentTarget.dataset.name,
      cateid: e.currentTarget.dataset.cateId,
      pagenum: 1,
      yuList:[]
    })
    this.getdatalist()
  },
  lwTap:function(e){
    this.setData({
      others: e.currentTarget.dataset.name,
      otherid: e.currentTarget.dataset.otherId,
      pagenum: 1,
      yuList: []
    })
    this.getdatalist()
  },

  //加载导航栏
  navList:function(){
    var that=this;
    wx.request({
      url: app.globalData.https + 'Reservations/getConditionList',
      method:'POST',
      header:{
        'content-type': 'application/json'
      },
      success:function(res){
        if(res.data.code === 1){
          that.setData({
            qyList:res.data.data.area,
            ymList:res.data.data.cates,
            lwList:res.data.data.others
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 1000
        })
        wx.navigateBack()
      }
    })
  },

  //渲染body列表
  getdatalist: function () {
    var that = this;
    wx.request({
      url: https + 'Reservations/getReservationList' ,
      data: {
        p: that.data.pagenum,       //从数据里获取当前页数
        lat: app.globalData.latitude,
        lon: app.globalData.longitude,
        areaid: that.data.areaid,
        cateid: that.data.cateid,      // 在reserve页面index.js修改要传的参数
        otherid: that.data.otherid,
        rsortid: that.data.rsortid
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.code == 1 && res.data.data != '') {
          var arr1 = that.data.yuList
          var arr2 = res.data.data
          var arr3 = arr1.concat(arr2)
          that.setData({
            yuList: arr3,
            isShow: true
          })
        } else {
          that.setData({
            loadMore: false
          })
        }
        if (that.data.yuList == ''){
          that.setData({
            isShow: false
          })
        }
      },
      fail:function(){
        wx.showModal({
          title: '友情提示',
          content: '网络错误',
          showCancel: false,
          success:function(res){
            wx.navigateBack()
          }
        })
      }
    })
  },

  onLoad: function (options) {
    var rsortid = options.rsortid
    if (rsortid == 1) {
      wx.setNavigationBarTitle({ title: '场馆预约' })
    } else if (rsortid == 2) {
      wx.setNavigationBarTitle({ title: '课程预约' })
    } else if (rsortid == 3) {
      wx.setNavigationBarTitle({ title: '私教预约' })
    } else if (rsortid == 4) {
      wx.setNavigationBarTitle({ title: '公益课预约' })
    }
    if(options.catename){
      this.setData({
        rsortid: rsortid,
        catename: options.catename,
        cateid: options.cateid
      })
    }else{
      this.setData({
        rsortid: rsortid
      })
    }
    var that = this
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {     //  未授权地理位置,先去授权，拒绝则返回
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.confirm) {             // 允许授权
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"]) {     // 允许打开设置
                      wx.showToast({
                        title: '授权成功'
                      })
                      wx.getLocation({
                        type: 'gcj02',
                        success: function (res) {
                          app.globalData.latitude = res.latitude
                          app.globalData.longitude = res.longitude
                          that.getdatalist();
                        }
                      })
                    } else { 
                      wx.navigateBack()
                    }
                  }
                })
              } else {
                wx.navigateBack()
              }
            }
          })
        }else{
          that.getdatalist();
        }
      }
    })
    this.navList();
  },

  //上拉加载
  onReachBottom: function () {                  //触底开始下一页
    var pagenum = this.data.pagenum + 1;       //获取当前页数并+1
    this.setData({
      pagenum: pagenum                       //更新当前页数
    })
    if(this.data.loadMore){
      this.getdatalist()                    //重新调用请求获取下一页数据
    }else{
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      pagenum: 1,
      yuList: []
    })
    this.getdatalist()
    wx.stopPullDownRefresh()                // 停止下拉
  },

  onShow: function () {
    
  }
})
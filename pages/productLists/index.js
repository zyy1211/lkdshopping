const app=getApp();
Page({
  data: {
    flag: true,
    isShow: true,
    drawMenu: false,
    jgRotate: false,
    tapIndex: 0,
    static: app.globalData.static,
    navTitle: [' ', '综合', '销量', '新品', '价格'],
    loadMore: true,
    img: [],
    pagenum:1,
    loadMore: true,
    goryLists: [],
    category_id: '',
    key: '',
    type: '0',
    busLists: [
      {
        imgUrl: '/images/avator.png', storeName: '水电费发广告',
        imgs: [{ links: '/images/tennis.jpg' }, { links: '/images/tennis.jpg' }, { links: '/images/tennis.jpg' }]
      }
    ]
  },

  // 跳转到商家详情
  toBusinessDetail:function(e){
    var store_id = e.currentTarget.dataset.store_id
    wx.navigateTo({
      url: '/pages/businessesDetail/index?store_id=' + store_id
    })
  },

  // 跳转到预约详情
  toReserveDetail:function(e){
    var goods_id = e.currentTarget.dataset.goods_id
    wx.navigateTo({
      url: '/pages/productDetail/index?goods_id=' + goods_id
    })
  },

  // 搜索商品 / 商家
  searchKey:function(e){
    var type = e.currentTarget.dataset.type
    var px = this.px()
    if(type == '0'){
      this.setData({
        pagenum: 1,
        img: [],
        type: '0',
        flag: true
      })
      this.proLists(px)
    }else if(type == '1'){
      this.setData({
        pagenum: 1,
        img: [],
        type: '1',
        flag: false
      })
      this.busiRequest()
    }
  },

  // 搜商家接口
  busiRequest:function(){
    var that = this
    wx.request({
      url: app.globalData.https + 'Goods/getStoreList',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        key: that.data.key
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            busLists: res.data.data
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  //商品同步到 data
  keySearch:function(e){
    this.setData({
      key: e.detail.value
    })
  },

  //导航栏切换
  navTap:function(e){
    var index=e.currentTarget.dataset.index
    var px = this.px()
    if(index == 0){
      this.setData({
        tapIndex: index,
        drawMenu: !this.data.drawMenu,
        pagenum: 1,
        img: []
      })
      this.proLists(px)
    }else if (index == 4) {
      this.setData({
        tapIndex: index,
        drawMenu: false,
        jgRotate: !this.data.jgRotate,
        pagenum: 1,
        img: []
      })
      this.proLists(px)
    } else {
      this.setData({
        tapIndex: index,
        drawMenu: false,
        pagenum: 1,
        img: []
      })
      this.proLists(px)
    }
  },

  //跳转到商品详情
  toProDetail:function(e){
    var goods_id=e.currentTarget.dataset.goods_id
    wx.navigateTo({
      url: '/pages/productDetail/index?goods_id='+goods_id,
    })
  },

  //商品列表
  proLists:function(px){
    var that=this
    wx.request({
      url: app.globalData.https +'Goods/getGoodsList',
      method:'POST',
      header:{ 'content-type': 'application/x-www-form-urlencoded' },
      data:{
        category_id: that.data.category_id,     
        px: px,
        p: that.data.pagenum,
        key: that.data.key,
        type: that.data.type
      },
      success:function(res){
        if (res.data.code == 1 && res.data.data != ''){
          var arr1 = that.data.img;
          var arr2 = res.data.data;
          var arr3 = arr1.concat(arr2);
          that.setData({
            img: arr3,
            isShow: true
          })
        } else {
          that.setData({
            loadMore: false
          })
        } 
        if (that.data.img == '') {
          that.setData({
            isShow: false
          })
        } 
      }
    })
  },

  //渲染分类列表元素
  goryLists: function(){
    var that=this
    wx.request({
      url: app.globalData.https + 'Goods/getConditionlist',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        category_id: that.data.category_id
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            goryLists: res.data.data.cates
          })
        }
      }
    })
  },

  //点击切换分类列表元素
  tapCate:function(e){
    var category_id=e.currentTarget.dataset.category_id
    var category_name=e.currentTarget.dataset.category_name
    this.setData({
      drawMenu: false,
      category_id: category_id,
      ['navTitle[' + 0 + ']']: category_name
    })
    this.setData({
      img: [],
      pagenum: 1,
      key: ''
    })
    var px=this.px()
    this.proLists(px)
  },

onLoad: function(options) {
  this.setData({
    ['navTitle[' + 0 + ']']: options.category_name,
    category_id: options.category_id
  })
  this.proLists('');
  this.goryLists();
},

//获取请求的参数 px （综合，销量等）
px:function(){
  var px = ''
  var idx = this.data.tapIndex
  var isTrue=this.data.jgRotate
  if (idx == 0) {
    px = ''
  } else if (idx == 1) {
    px = 'zh'
  } else if (idx == 2) {
    px = 'xl'
  } else if (idx == 3) {
    px = 'xp'
  } else if (idx == 4) {
    if (isTrue) {
      px = 'jgd'
    } else {
      px = 'jgg'
    }
  }
  return px
},

//上拉加载
onReachBottom: function () {                 
  var pagenum = this.data.pagenum + 1;       //获取当前页数并+1
  this.setData({
    pagenum: pagenum,                        //更新当前页数
  })
  var px=this.px()
  if (this.data.loadMore) {
    this.proLists(px)                   //重新调用请求获取下一页数据
  } else {
    wx.showToast({
      title: '没有更多数据了',
      icon: 'none'
    })
  }
},

//下拉刷新
onPullDownRefresh: function () {
  var px = this.px()
  this.setData({
    pagenum: 1,   
    img:[]                    
  })
  this.proLists(px) 
  wx.stopPullDownRefresh()                // 停止下拉
},

onShow: function() {

},

onHide: function() {

},

})
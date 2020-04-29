// pages/carLists/index.js
const app = getApp()
Page({
  data: {
    static: app.globalData.static,
    totalNum: 0,
    isShowManage: true,
    totalPri: '0',
    selectAll: false,
    cartList: [],
    pageNum: 1,
    isShow: false
  },

  //跳转到商品详情页
  toProDetail: function (e) {
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '/pages/productDetail/index?goods_id=' + goods_id,
    })
  },

  //结算商品总数量,点击跳到支付页面
  cal: function () {
    var lists = this.data.cartList;
    var count = this.data.totalNum
    if (count == 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }
    var goods_ids = ''
    var store_id = []
    for (var i = 0; i < lists.length; i++) {
      for (var j = 0; j < lists[i].list.length; j++) {
        if (lists[i].list[j].selected) {
          store_id.push(lists[i].store_id)
          goods_ids = (lists[i].list[j].id + ',' + goods_ids)
        }
      }
    }
    for (var i = 0; i < store_id.length; i++) {
      if (store_id[0] != store_id[i]) {
        wx.showModal({
          title: '友情提示',
          content: '不能跨店结算',
          showCancel: false
        })
        return
      }
    }
    goods_ids = String(goods_ids).substring(0, goods_ids.length - 1)
    wx.navigateTo({
      url: '/pages/pay/index?order_type=0' + '&goods_ids=' + goods_ids
    })
  },

  //计算商品总数量/价格
  calTotalNum: function () {
    var that = this;
    var lists = that.data.cartList;
    var sum = 0;
    var price = 0;
    for (var i = 0; i < lists.length; i++) {
      for (var j = 0; j < lists[i].list.length; j++) {
        if (lists[i].list[j].selected) {
          sum += parseInt(lists[i].list[j].total_num)
          price = parseFloat(parseFloat(price) + (parseInt(lists[i].list[j].total_num) * parseFloat(lists[i].list[j].goods_price))).toFixed(2)
        }
      }
    }
    that.setData({
      totalNum: sum,
      totalPri: price
    })
  },

  //勾选商店名称
  selcetStroe: function (e) {
    var that = this;
    var idx = e.currentTarget.dataset.idx
    that.setData({
      ['cartList[' + idx + '].selected']: !that.data.cartList[idx].selected
    })

    var array = [];     // 长度为 0，则商店被选中状态
    var array1 = [];    // 长度为 0，则商品被选中状态

    //判断当前商店是否被选中
    if (!that.data.cartList[idx].selected) {
      for (var i = 0; i < that.data.cartList[idx].list.length; i++) {
        array.push(i)
      }
    }
    if (array.length > 0) {
      for (var i = 0; i < that.data.cartList[idx].list.length; i++) {
        that.setData({
          ['cartList[' + idx + '].list[' + i + '].selected']: false,
          selectAll: false
        })
      }
    } else {
      for (var i = 0; i < that.data.cartList[idx].list.length; i++) {
        that.setData({
          ['cartList[' + idx + '].list[' + i + '].selected']: true
        })
      }
    }

    // 判断所有商店是否被选中
    for (var i = 0; i < that.data.cartList.length; i++) {
      if (!that.data.cartList[i].selected) {
        array1.push(1)
      }
    }
    if (array1.length > 0) {
      that.setData({
        selectAll: false
      })
    } else {
      that.setData({
        selectAll: true
      })
    }
    that.calTotalNum()
  },

  // 单选
  radioChecked: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index
    var idx = e.currentTarget.dataset.idx
    that.setData({
      ['cartList[' + idx + '].list[' + index + '].selected']: !that.data.cartList[idx].list[index].selected
    })

    for (var i = 0; i < that.data.cartList[idx].list.length; i++) {
      if (that.data.cartList[idx].list[i].selected) {
        that.setData({
          ['cartList[' + idx + '].selected']: true
        })
      } else {
        that.setData({
          ['cartList[' + idx + '].selected']: false
        })
      }
    }
    // 判断全选按钮
    var array = [];
    for (var i = 0; i < that.data.cartList.length; i++) {
      for (var j = 0; j < that.data.cartList[i].list.length; j++) {
        if (!that.data.cartList[i].list[j].selected) {
          array.push(i)
        }
      }
    }
    if (array.length > 0) {
      that.setData({
        selectAll: false,
        ['cartList[' + array[0] + '].selected']: false
      })
    } else {
      that.setData({
        selectAll: true
      })
    }
    that.calTotalNum()
  },

  //全选
  selectAll: function () {
    for (var i = 0; i < this.data.cartList.length; i++) {
      for (var j = 0; j < this.data.cartList[i].list.length; j++) {
        this.setData({
          ['cartList[' + i + '].selected']: !this.data.selectAll,
          ['cartList[' + i + '].list[' + j + '].selected']: !this.data.selectAll
        })
      }
    }
    this.setData({
      selectAll: !this.data.selectAll
    })
    this.calTotalNum();
  },

  //删除
  Delete: function () {
    var that = this
    var ids = []
    for (var i = 0; i < that.data.cartList.length; i++) {
      for (var j = 0; j < that.data.cartList[i].list.length; j++) {
        if (that.data.cartList[i].list[j].selected) {
          ids.push(that.data.cartList[i].list[j].id)
        }
      }
    }
    if (ids != '') {
      wx.showModal({
        title: '确定删除商品吗？',
        content: '',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '',
        confirmText: '确定',
        confirmColor: '',
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: app.globalData.https + 'Cart/delete',
              method: 'post',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              data: {
                token: app.globalData.token,
                ids: ids
              },
              success: function (res) {
                if (res.data.code == 1) {
                  wx.showToast({
                    title: res.data.msg,
                  })
                  that.cartLists()
                  that.setData({
                    totalPri: 0,
                    totalNum: 0,
                    selectAll: false
                  })
                } else {
                  wx.showToast({
                    title: res.data.msg,
                  })
                }
              }
            })
          }
          that.setData({
            isShowManage: !that.data.isShowManage
          })
        }
      })
    } else {
      wx.showToast({
        title: '请选择要删除的商品',
        icon: 'none'
      })
    }
  },

  //管理/完成
  showManage: function () {
    this.setData({
      isShowManage: !this.data.isShowManage
    })
  },

  // 数量减
  decrease: function (e) {
    var that = this
    var id = e.currentTarget.dataset.id
    var num = e.currentTarget.dataset.num
    var idx = e.currentTarget.dataset.idx;
    var index = e.currentTarget.dataset.index;
    if (parseInt(num) > 1) {
      that.setData({
        ['cartList[' + idx + '].list[' + index + '].total_num']: parseInt(that.data.cartList[idx].list[index].total_num) - 1
      })
      wx.request({
        url: app.globalData.https + 'Cart/sub',
        method: 'post',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          token: app.globalData.token,
          id: id
        }
      })
    }
    if (that.data.cartList[idx].list[index].selected) {
      that.calTotalNum();
    }
  },

  // 数量加
  increase: function (e) {
    var that = this;
    var idx = e.currentTarget.dataset.idx;
    var index = e.currentTarget.dataset.index;
    var goods = e.currentTarget.dataset.goods_info
    wx.request({
      url: app.globalData.https + 'Cart/add',
      method: 'POST',
      data: {
        token: app.globalData.token,
        id: goods.id,
        goods_id: goods.goods_id,
        goods_num: 1,
        goods_sku_id: goods.goods_sku_id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          return
        } else if (res.data.code == 1) {
          that.setData({
            ['cartList[' + idx + '].list[' + index + '].total_num']: parseInt(that.data.cartList[idx].list[index].total_num) + 1
          }, () => {
            that.calTotalNum();
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '网络错误！',
          icon: 'none'
        })
      }
    })
  },

  //请求购物车列表
  cartLists: function () {
    var that = this
    var p = that.data.pageNum
    var https = app.globalData.https
    wx.request({
      url: https + 'Cart/getList',
      method: 'POST',
      data: {
        token: app.globalData.token,
        p: p
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.code == 1) {
          if (res.data.data == '') {
            that.setData({
              isShow: false
            })
          } else {
            that.setData({
              isShow: true,
              cartList: res.data.data
            })
          }
        } else if (res.data.code == -1) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
      }
    })
  },

  onLoad: function (options) {
    // this.cartLists()
  },

  onShow: function () {
    this.cartLists()
    this.setData({
      totalPri: 0,
      totalNum: 0,
      selectAll: false
    })
  },

  onHide: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})
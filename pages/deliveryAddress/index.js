// pages/deliveryAddress/index.js
const app= getApp()
const https= app.globalData.https
Page({
  data: {
    defaultId:null,    //地址默认
    addrList:[],
    isShow:true
  },

  //删除地址
  deleteAddress:function(e){     
    var that=this
    wx.showModal({
      title: '确定删除该地址吗？',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: https + 'UserAddress/delete',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              token: app.globalData.token,
              address_id: e.currentTarget.dataset.address_id
            },
            success: function (res){
              if(res.data.code == 1){
                that.addrLists();
                wx.showToast({
                  title: res.data.msg,
                })
              } else if (res.data.code == -1) {
                wx.navigateTo({
                  url: '/pages/login/index'
                })
              }else{
                wx.showToast({
                  title: res.data.msg,
                })
              }
            }
          })
        } else if (res.cancel) {
          return
        }
      }
    })
  },

  //编辑收货地址
  toEditAddress:function(e){
    wx.navigateTo({
      url: '/pages/addAddress/index?address_id='+e.currentTarget.dataset.address_id
    })
  },

  //切换默认地址
  defaultTap:function(e){
    var idx = e.currentTarget.dataset.index
    var defaultId= this.data.defaultId
    if( idx != defaultId ){
      this.setData({
        defaultId: idx
      })
      wx.request({
        url: https + 'UserAddress/setDefault',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          token: app.globalData.token,
          address_id: e.currentTarget.dataset.address_id
        },
        success: function (res){
          if(res.data.code == 1){
            wx.showToast({
              title: res.data.msg,
            })
          }else{
            wx.showToast({
              title: res.data.msg,
              icon:'none'
            })
          }
        }
      })
    }
  },

  //请求收货地址列表
  addrLists:function(){
    var that=this
    wx.request({
      url: https + 'UserAddress/lists',
      method:'POST',
      header:{
        'content-type': 'application/x-www-form-urlencoded'
      },
      data:{
        token: app.globalData.token
      },
      success:function(res){
        var data=res.data.data
        if( res.data.code == 1){
          if(data.lists.length != 0){
            for(var i in data.lists){
              if( data.lists[i].default == '1' ){
                that.setData({
                  addrList: data.lists,
                  defaultId: i,
                  isShow: true
                })
              } else {
                that.setData({
                  addrList: data.lists,
                  isShow: true
                })
              }
            }
          }else{
            that.setData({
              isShow: false
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
    // this.addrLists();
  },

  onShow: function () {
    this.addrLists();
  },

  onHide: function () {

  }
})
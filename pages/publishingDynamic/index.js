const paySuccess = require('../../utils/util.js');
const app = getApp()

Page({
  data: {
    val: '',
    imgs:[],
    videos: [],
    isModialog: false,
    isSend: false
  },

  // 发布  图片视频和动态内容一起保存到服务器
  uploadSave: function (val, arr, stype, formid){
    var str = ''
    var that = this
    for(var i=0;i<arr.length;i++){
      str = str + arr[i] +'$'
    }
    str = str.substring(0, str.length - 1) 
    wx.request({
      url: app.globalData.https + 'Social/makeSocial',
      method: 'post',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        token: app.globalData.token,
        content: val,
        imgs: str,
        stype: stype
      },
      success: function (res) {
        if (res.data.code == 1) {
          wx.hideLoading()
          paySuccess.paySuccess(app.globalData.https + 'Pushs/getFormID', 'post', { token: app.globalData.token, formid: formid, type: 1 })
          let pages = getCurrentPages();              //当前页面
          let prevPage = pages[pages.length - 2];     //上一页面
          prevPage.setData({                          //直接给上移页面赋值
            method: true
          });
          wx.showToast({
            title: res.data.msg,
            duration: 2000
          })
          setTimeout(function(){
            wx.navigateBack()
          },2000)
        }else{
          wx.hideLoading()
          that.setData({
            isSend: false
          })
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function () {
        wx.hideLoading()
        that.setData({
          isSend: false
        })
        wx.showToast({
          title: '网络错误，上传失败',
          icon: 'none'
        })
      }
    })
  },

  //  发布  接收返回的图片和视频路径
  upload:function(e){
    var that = this
    var formid = e.detail.formId
    var imgs = that.data.imgs
    var val = that.data.val
    var video = that.data.videos
    var uploadArray = []
    var stype;
    if (val == '' && imgs == '' && video == '' ){
      wx.showToast({
        title: '请选择上传文件',
        icon: 'none'
      })
      return
    } else if (imgs != '' && video != ''){
      wx.showToast({
        title: '请选择图片或者视频',
        icon: 'none'
      })
      return
    }else{
      if(imgs == ''){
        uploadArray = video
        stype = 0
      } else if (video == ''){
        uploadArray = imgs
        stype = 1
      }
    }
    that.setData({
      isSend: true
    })
    var copyArr = [].concat(uploadArray)      // 复制一份数组递减
    var arr = []
    wx.showLoading({
      title: '正在上传...',
    })
    if (uploadArray == ''){
      that.uploadSave(val, uploadArray, '2', formid)
      return
    }
    for (var i = 0; i < uploadArray.length; i++ ){
      wx.uploadFile({
        url: app.globalData.https + 'Social/uploadImgs', 
        filePath: uploadArray[i],
        name: 'file',
        formData: {
          token: app.globalData.token
        },
        success(res) {
          var data = JSON.parse(res.data)
          if( data.code == 1 ){
            arr.push(data.data)
            copyArr.splice(-1,1)          // 数组为空，文件也就上传完了
            if (copyArr == '') {
              that.uploadSave(val, arr, stype, formid)
            }
          }else if( data.code == 0 ){
            wx.hideLoading()
            that.setData({
              isSend: false
            })
            wx.showToast({
              title: data.msg,
              icon: 'none'
            })
            return
          }
        },
        fail:function(){
          wx.hideLoading()
          that.setData({
            isSend: false
          })
          wx.showToast({
            title: '网络错误，上传失败',
            icon: 'none'
          })
        }
      })
    }
  },

  // 删除图片/视频
  delete:function(e){
    var dele = e.currentTarget.dataset.dele
    var imgs = this.data.imgs
    var videos = this.data.videos
    if ( dele == 'photo' ){
      var index = e.currentTarget.dataset.index
      imgs.splice( index,1 )
      this.setData({
        imgs: imgs
      })
    } else if (dele == 'video'){
      this.setData({
        videos: []
      })
    }
  },

  // 选择图片
  takePhoto: function(e){
    var that = this
    var sourceType = e.currentTarget.dataset.sourcetype
    wx.chooseImage({
      sourceType: [sourceType],
      success(res) {
        var imgs = that.data.imgs
        var count = imgs.length + res.tempFilePaths.length
        var arr = res.tempFilePaths
        var all = arr.concat(imgs)
        if ( count > 9 ){
          wx.showToast({
            title: '最多上传9张图片',
            icon: 'none'
          })
          return
        }
        that.setData({
          imgs: all
        })
      }
    })
  },

  // 拍摄小视频
  takeVideo:function(){
    var that = this
    var videos = that.data.videos
    if (videos.length >= 1){
      wx.showToast({
        title: '最多选择一个视频',
        icon: 'none'
      })
      return
    }
    wx.chooseVideo({
      sourceType: ['camera'],
      compressed: true,
      maxDuration: 30,
      camera: 'back',
      success(res) {
        videos.push(res.tempFilePath)    // array.push（）返回的是添加后数组的长度
        that.setData({
          videos: videos
        })
      }
    })
  },

  // 发布内容
  publish:function(e){
    this.setData({
      val: e.detail.value
    })
  },

  // 打开/关闭模态框
  modialog:function(){
    this.setData({
      isModialog: !this.data.isModialog
    })
  },

  onLoad: function (options) {

  },

  onShow: function () {

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
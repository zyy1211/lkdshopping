
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 支付和发布动态
const paySuccess =  (url,method,data) => {
  wx.request({
    url: url,
    method: method,
    data: data,
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {}
  })
}

// 获取手机号
const getPhoneNumber =  (data, doSuccess) => {
  wx.request({
    url: 'https://app.like-dong.com/Ucenter/getPhoneNumber',
    method: 'post',
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    data: data,
    success: function (res) {
      if (res.data.code == 1) {
        wx.showToast({
          title: res.data.msg
        })
        doSuccess('success')
      }else{
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
        doSuccess('fail')
      }
    }
  })
}

// 请求是否绑定手机号
const bindPhone = (data,doSuccess) => {
  wx.request({
    url: 'https://app.like-dong.com/Ucenter/checkPhone',
    method: 'post',
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    data: data,
    success: function (res) {
      if (res.data.code == 1) {
        doSuccess(res.data.data)
      }
    }
  })
}

module.exports = {
  formatTime: formatTime,
  paySuccess: paySuccess,
  getPhoneNumber: getPhoneNumber,
  bindPhone: bindPhone
}

//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    wx.request({
        url:'http://bx-api.pingan.com.cn/oauth/oauth2/access_token',
        method:'POST',
        data:{
          "grant_type":"client_credentials",
          "client_id":"P_BAO_GU_",
          "client_secret":"zM5Kd41p",
        },
        header: {
          'content-type':'application/json'
        },
        success: res=>{
          this.globalData.access_token = res.data.data.access_token
          // console.log(this.globalData)
        },
        fail:function(res){

        }
    })
    wx.request({
        url:'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=Wy64wzelyQVy9AkxCN1MyriT&client_secret=i4EqpwWh7RgGp5xnZ5MOFA29TFGeOd72',
        method:'POST',
        header: {
          'content-type':'application/json'
        },
        success: res=>{
          this.globalData.baiduToken = res.data.access_token
          // console.log(this.globalData)
        },
        fail:function(res){

        }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if(!res.authSetting['scope.record']){
          wx.authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              console.log("succ auth")
            },fail() {
              console.log("fail auth")
            }
          })
        }else{
          console.log("record has been authed")
        }
        // if (res.authSetting['scope.userInfo']) {
        //   // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        //   wx.getUserInfo({
        //     success: res => {
        //       // 可以将 res 发送给后台解码出 unionId
        //       this.globalData.userInfo = res.userInfo

        //       // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        //       // 所以此处加入 callback 以防止这种情况
        //       if (this.userInfoReadyCallback) {
        //         this.userInfoReadyCallback(res)
        //       }
        //     }
        //   })
        // }
      }
    })
  },
  // 权限询问
  getRecordAuth: function() {
    console.log('9876')
    wx.getSetting({
      success(res) {
        console.log("succ")
        console.log(res)
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
                // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                console.log("succ auth")
            }, fail() {
                console.log("fail auth")
            }
          })
        } else {
          console.log("record has been authed")
        }
      }, fail(res) {
          console.log("fail")
          console.log(res)
      }
    })
  },
  globalData: {
    userInfo: null,
    access_token:'',
    baiduToken:'',
    host:'http://30.4.165.188'
  }
})
// pages/speak/speak.js
const plugin = requirePlugin("WechatSI")
var util = require('../../utils/util')
const app = getApp()
const host = app.globalData.host

import { language } from '../../utils/conf.js'

// 获取**全局唯一**的语音识别管理器**recordRecoManager**
let manager = plugin.getRecordRecognitionManager()
let innerAudioContext = wx.createInnerAudioContext();
let backgroundAudioManager = wx.getBackgroundAudioManager()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    speakValue:'',
    speakT:[],
    speakL:[],
    speakR:[],
    scrollTop:0,
    toView:'',
    windowHeight:0,
    scrollHeight:0,
    voiceFlag:true,
    travelT:['夏威夷','杭州','香港','北京','武汉','重庆'],
    travelDay:['1-4天','5-7天','8-10天','11-14天','15-21天'],
    city:'',
    speakC:'长按说话',
    autoSpeak:true,
    baiduToken:'',
    chatbotToken:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  goToQ:function(){
    wx.navigateTo({
      url: '../question01/question01',
    })
  },
  fm:function(){
    wx.navigateTo({
      url: '../fm/fm',
    })
  },
  ftravel:function(e){
    let cityCode = e.currentTarget.dataset.content
    wx.navigateTo({
      url: `../travel/travel?cityCode=${cityCode}`,
    })
  },
  travel:function(e){
    let that = this
    let content = e.currentTarget.dataset.content
    // console.log(content)
    wx.setStorage({//存储到本地
      key:"city",
      data:content
    })
    let id = 'id_0' + Date.parse(new Date()) / 1000
    let nid = 'id_1' + Date.parse(new Date()) / 1000
    let rData = { id:id,content: content,me:true}
    let lData = {id:nid,content:'好的，那你预计旅行多久？',me:false,travelD:true}
    let speakT = this.data.speakT
        speakT.push(rData)
        speakT.push(lData) 
    that.setData({
      // travelDay:['1-4天','5-7天','8-10天','11-14天','15-21天'],
      speakT: speakT,
      toView: nid
    })
    that.play(lData.content)
    wx.getStorage({
      key:'city',
      success:function(res){
        that.setData({
          city:res.data
        })
      }
    })
  },
  travelD:function(e){
    let that = this
    let city = that.data.city
    let cityCode
    switch (city) {
      case '夏威夷':
        cityCode=0
        break;
      case '杭州':
        cityCode=1
      break;
      case '香港':
        cityCode=2
      break;
      case '北京':
        cityCode=3
      break;
      case '武汉':
        cityCode=4
      break;
      case '重庆':
        cityCode=5
      break;
    }
    let content = e.currentTarget.dataset.content
    console.log(cityCode)
    let id = 'id_0' + Date.parse(new Date()) / 1000
    let nid = 'id_1' + Date.parse(new Date()) / 1000
    let rData = { id:id,content: content,me:true}
    let lData = {id:nid,content:`好的，安安为您推荐了${city}旅游险`,me:false,recommend:true,cityCode:cityCode}
    let speakT = this.data.speakT
        speakT.push(rData)
        speakT.push(lData) 
    that.setData({
      speakT: speakT,
      toView: nid
    })
    that.play(lData.content)
  },
  bindKeyInput:function(e){
    this.setData({
      speakValue:e.detail.value
    })
  },
  sendMsg:function(content,source){
    let nowV 
    // console.log('877'+content,source)
    let that = this
    console.log('source09'+source)
    if(source === 'speak'){
      nowV = content
      console.log('898')
    }else{
      nowV = that.data.speakValue
    }
    console.log('09'+nowV)
    if (nowV.length === 0){
      wx.showToast({
        title: '不能发送空的内容！',
        icon: 'none'
      })
    } else if (nowV.indexOf('家庭')>=0){
      let id = 'id_0' + Date.parse(new Date()) / 1000
      let nid = 'id_1' + Date.parse(new Date()) / 1000
      let rData = { id:id,content: nowV,me:true}
      let lData = {id:nid,content:'好的，首先需要你花2分钟回答8道题，让安安了解家庭风险后再给投保建议。我们承诺对你的个人信息严格保密，仅限用于系统分析。',me:false,onceA:true}
      let speakT = this.data.speakT
          speakT.push(rData)
          speakT.push(lData)
      let len = speakT.length
      that.setData({
        speakT: speakT,
        speakValue:'',
        toView: nid
      })
      that.play(lData.content) 
    }else if (nowV.indexOf('旅游')>=0){
      let id = 'id_0' + Date.parse(new Date()) / 1000
      let nid = 'id_1' + Date.parse(new Date()) / 1000
      let rData = { id:id,content: nowV,me:true}
      let lData = {id:nid,content:'您的旅游目的地在哪?',me:false,travel:true}

      let speakT = this.data.speakT
          speakT.push(rData)
          speakT.push(lData)
      let len = speakT.length
      that.setData({
        speakT: speakT,
        speakValue:'',
        toView: nid
      }) 
      that.play(lData.content)
    }else {
      let id = 'id_0' + Date.parse(new Date()) / 1000
      let rData = { id:id,content: nowV,me:true}
      let speakT = this.data.speakT
          speakT.push(rData)
      let len = speakT.length
      that.setData({
        speakT: speakT,
        speakValue:'',
        toView: id
      })
      // 文字转语音
      // this.play('您的满意是我们的追求')
      // var fd = new FormData()
      let url = `http://bx-api.pingan.com.cn/open/pingan/chatbot?access_token=4496294F4B38493A8B125F39B47312A0&request_id=1536650468`
      wx.request({
        // url: host +'/pingan/chatbot',
        url: url,
        method:'POST',
        data: util.json2Form({
          version: 0.1,
          clientType: 'web',
          robotId: '1030',
          userId: 'test1',
          sessionId: '10231451574',
          question: nowV
        }),
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success:function(res){
          let resJ = res.data
          console.log(resJ)
          resJ = resJ?resJ.slice(53, resJ.length-2):''
          resJ = JSON.parse(resJ)
          // console.log(res.data)
          // console.log(resJ)
          // wx.showToast({
          //   title: resJ.content.answer,
          //   icon: 'none'
          // })
          if (resJ.status&&resJ.status.state === '1'){
            
            // 文字转语音
            that.play(resJ.content.answer)
            // console.log(resJ.content.answer)
            let nid = 'id_1' + Date.parse(new Date()) / 1000
            console.log(nid)
            let fData = { id:nid,content: resJ.content.answer, me: false }
            speakT.push(fData)
            that.setData({
              speakT: speakT,
              toView: nid
            }) 
          }
        },
        fail:function(res){
          console.log(res)
          wx.showToast({
            title: 'error',
            icon: 'none'
          })
        }
      })
    }    
  },
  play:function(content){
    manager.start()
    let that = this
    // 先清空背景音
    innerAudioContext.stop()
    // wx.stopBackgroundAudio()
    that.setData({
      voiceFlag:false,
      autoSpeak:true,
    })
    innerAudioContext.autoplay = true
    plugin.textToSpeech({
      lang: "zh_CN",
      tts: true,
      content: content,
      success: function(res) {
          // manager.stop()
          innerAudioContext.src = res.filename
          // backgroundAudioManager.src = res.filename
          // backgroundAudioManager.play()
          innerAudioContext.play()
          //音频播放结束
          innerAudioContext.onEnded(()=>{
            manager.stop()
          })
          // innerAudioContext.onPlay(() => {
          //   console.log('开始播放')
          //   // wx.showToast({
          //   //   title: '开始播放',
          //   //   icon: 'none'
          //   // })
          // })
      },
      fail: function(res) {
          console.log("fail tts", res)
          manager.stop()
      }
    })

    // 百度文字转语音
    // let voiceUrl = `https://tsn.baidu.com/text2audio?tex=${content}&lan=zh&cuid=%27sungeliang_shilihuan_gaoyizhen%27&ctp=1&tok=24.fb18de0bec5f73dd6beb2844aa90de25.2592000.1539938907.282335-11276997`
    // content = encodeURI(content)
    // let voiceUrl = `https://tsn.baidu.com/text2audio?tex=${content}&lan=zh&cuid=%27sungeliang_shilihuan_gaoyizhen%27&ctp=1&tok=${that.data.baiduToken}`
    // console.log(voiceUrl)
    // wx.downloadFile({
    //   url:voiceUrl,
    //   success:function(res){
    //     console.log(res)
    //     innerAudioContext.src = res.tempFilePath
    //     innerAudioContext.play()
    //     // manager.stop()
    //   },
    //   fail:function(err){
    //     console.log(err)
    //   }
    // })
    
  },
 playS:function(event){
  manager.start()
  let content  = event.currentTarget.dataset.content;
  let that = this
  let autoSpeak = !that.data.autoSpeak
  console.log(autoSpeak)
    // 先清空背景音
    innerAudioContext.stop()
    // wx.stopBackgroundAudio()
    
    that.setData({
      voiceFlag:false,
      autoSpeak:autoSpeak
  })
  innerAudioContext.autoplay = true
  plugin.textToSpeech({
    lang: "zh_CN",
    tts: true,
    content: content,
    success: function(res) {
      // manager.stop()
      // console.log("succ tts", res.filename) 
      innerAudioContext.src = res.filename
      // backgroundAudioManager.src = res.filename
      
      if(autoSpeak){
        innerAudioContext.play()
        //音频播放结束
        innerAudioContext.onEnded(()=>{
          manager.stop()
        })
        // backgroundAudioManager.play()
        // innerAudioContext.onPlay(() => {
        //   console.log('开始播放')
        //   // wx.showToast({
        //   //   title: '开始播放',
        //   //   icon: 'none'
        //   // })
        // })
      }else{
        manager.stop()
        innerAudioContext.stop()
      }
    },
    fail: function(res) {
        console.log("fail tts", res)
        manager.stop()
    }
  })
  // if(autoSpeak){
  //   content = encodeURI(content)
  //   let voiceUrl = `https://tsn.baidu.com/text2audio?tex=${content}&lan=zh&cuid=%27sungeliang_shilihuan_gaoyizhen%27&ctp=1&tok=${that.data.baiduToken}`
  //   console.log(voiceUrl)
  //   wx.downloadFile({
  //     url:voiceUrl,
  //     success:function(res){
  //       console.log(res)
  //       innerAudioContext.src = res.tempFilePath
  //       innerAudioContext.play()
  //       // manager.stop()
  //     },
  //     fail:function(err){
  //       console.log(err)
  //     }
  //   })
  // }else{
  //   innerAudioContext.stop()
  // }
  // manager.stop()
  },
  stopManager:function(){
    manager.stop()
    this.setData({
      voiceFlag:false
    })
  },
  startR:function(e){

    // 先清空背景音
    innerAudioContext.stop()
    let that = this
    that.stopManager()
    that.setData({
      voiceFlag:true,
      speakC:'松开结束'
    })
    // manager.stop()
    // console.log(that.data.speakC)
    // manager.stop()
    
    console.log('start')
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    manager.start({
      lang: 'zh_CN',
    })
    
  },
  stopR:function(e){
    console.log('stop76')
    let that = this
    that.setData({
      speakC:'长按说话'
    })
    manager.stop()
    
  },
  
  /**
   * 初始化语音识别回调
   * 绑定语音播放开始事件
   */
  initRecord: function() {
    let that = this
    //有新的识别内容返回，则会调用此事件
    manager.onRecognize = (res) => {
      
    }

    // 识别结束事件
    manager.onStop = (res) => {
      let content = res.result.substring(0,res.result.length-1)
      // wx.showToast({
      //   title: content,
      // })
      // this.setData({
      //   voiceFlag:true,
      //   speakValue:content
      // })
      if(that.data.voiceFlag){
        that.sendMsg(content,'speak')
      }
      
    }

    // 识别错误事件
    manager.onError = (res) => {

      // this.setData({
      //   recording: false,
      //   bottomButtonDisabled: false,
      // })

    }
  },
  onLoad: function (options) {
    console.log(app.globalData.access_token)
    innerAudioContext = wx.createInnerAudioContext();
    // manager.start()
    let id = 'id_' + Date.parse(new Date()) / 1000
    let fData = { id:id,content:'您好，我是安安，请告诉安安你感兴趣的话题，例如【家庭综合保障】【我要旅游】或其他感兴趣的话题...',me:false}
    let speakT = this.data.speakT
        speakT.push(fData)
    this.setData({
      speakT: speakT,
      baiduToken:app.globalData.baiduToken,
      chatbotToken:app.globalData.access_token
    })
    wx.getSystemInfo({
      success: (res) => {
        // console.log(res);
        this.setData({
          windowHeight: res.windowHeight,
          scrollHeight: (res.windowHeight - 70) * 750 / res.screenWidth
        })
      }
    })
    this.play(fData.content)
    this.initRecord()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.play(this.data.speakT[this.data.speakT.length-1].content)
    manager.stop()
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // manager.stop()
    innerAudioContext.stop()
    // innerAudioContext.destroy();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // manager.stop()
    innerAudioContext.stop()
    innerAudioContext.destroy();
    // wx.stopBackgroundAudio()
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})
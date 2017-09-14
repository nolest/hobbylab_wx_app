//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    page_title : ['HobbyLab','我的订单'],
    icons : {
      location : '../../image/index/address-icon-32x32.png',
      index : '../../image/index/index-icon-cur.png',
      index_2 : '../../image/index/index-icon.png',
      order : '../../image/index/order-icon-cur.png',
      order_2 : '../../image/index/order-icon.png'
    },
    windowHeight : app.globalData.systemInfo.windowHeight,
    windowWidth : app.globalData.systemInfo.windowWidth  
  },
  onLoad: function (options) {
    var that = this;
    //调用应用实例的方法获取全局数据
      // app.ready(function(systemInfo){ 
      //   //成功获取登录状态
      //   that.setData({
      //     account_type : systemInfo.account_type
      //   })
      //     that.setData({
      //       page_order : 1,
      //       tap_cur : 1,
      //       order_list : []
      //     })
      //     app.globalData.router.index.tap_cur = 1;
      //     that.fetch_order(); 
      //   },
      //   function(userInfo){
      //     that.setData({
      //       userInfo:userInfo
      //     });
      //   },
      //   function(){
          
      //   });
  },
  tap_childs : function(e){
    var that = this;
    if(!that.data.navigating){
      wx.navigateTo({
        url: '../details/details?goods_id=' + e.currentTarget.dataset.goodsid
      })
      that.setData({
        navigating : true
      })
      setTimeout(function(){
        that.setData({
          navigating : false
        })
      },1000)
    }
  },
  fetch : function(){
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });
    return
    wx.request({
      url: 'https://mojikids.yueus.com/wx_api/index/index.php', //仅为示例，并非真实的接口地址
      data: {
        yue_login_id: app.globalData.yue_login_id,
        location_id: '',
        page : that.data.page
      },
      header: {
          'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res);
      },
      fail : function(){

      },
      complete : function(){
        wx.hideToast();
        that.setData({
          fetching_index :false
        })
      }
    })
  },
  fresh_title : function(){
    //刷新顶部栏
    wx.setNavigationBarTitle({
      title : this.data.page_title[0]
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onHide : function(){
    var that = this;
  },
  onShow:function(){
    var that = this;
    // 页面显示success
  },
  onShareAppMessage: function(){
    //分享设置
    var obj = {
      title: 'MOJIKIDS莫吉相馆',
      path: '/pages/index/index'
    }
    return obj
  }
})

// pageswo1/mine/mine.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      fetch_lock:false,
      mine_info:{}
  },
  //获取数据
  fetch:function(){
    var self = this;
    //检测是否获取数据被锁
    if (self.data.fetch_lock)
    {
        return;
    }
    //设置Loading
    wx.showToast({
      title: '加载数据中',
      icon: 'loading',
      duration: 10000
    });

    self.data.fetch_lock = true;

    app.util.yue_request({
      url: app.globalData.api_domain + '/mine/get_mine.php',
      data: {
        app_session: app.globalData.app_session
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res, resr) {
        // success
        wx.hideToast();
        console.log(resr);
        var res_data = resr.data.result_data;
        console.log(res_data);
        if (res_data.data.result == "1") {
          self.setData({
            mine_info: res_data.data,
          });
        }
        else {
          //出现错误
          wx.hideToast();
          wx.showToast({
            title: "加载数据出错",
            icon: 'loading',
            duration: 1500
          });
        }
      },
      fail: function (res) {
        // fail
        wx.hideToast();
        wx.showToast({
          title: '加载数据出错',
          icon: 'loading',
          duration: 1500
        });
      },
      complete: function (res) {
        // complete
        self.data.fetch_lock = false;
      }
    })
  },
  //编辑点击
  edit_mine_click:function(){
    var self = this;
    wx.navigateTo({
      url: '/pages/mine_edit/mine_edit'
    });
  },
  //栏目点击
  item_click:function(event){
    var self = this;
    var item_type = event.currentTarget.dataset.type;
    switch (item_type){
      case "order":
        wx.navigateTo({
          url: '/pages/order_list/order_list'
        });
      break;
      case "coupon":
        wx.navigateTo({
          url: '/pages/coupon/coupon'
        });
      break;
      case "vip":
        //根据是否card用户进行交互处理
        if (self.data.mine_info.is_card_user == 0) {
          //未开卡
          wx.showModal({
            title: '提示',
            content: '咦，您还没有办理会员卡，请关注微信公众号【HOBBYLAB爱好研究所】-领取会员卡',
            showCancel: false,
            success: function (s) {
              if (s.confirm) {
              } else if (s.cancel) {
              }
            }
          });
        }
        else {
          //已开卡
          wx.openCard({
            cardList: self.data.mine_info.card_list,
            success: function (res) {
            }
          });
        }
      break;
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.get_window_info(this);    
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
    var self = this;
    //设置标题
    wx.setNavigationBarTitle({
      title: '我的'
    });
    app.ready(function () {
      if (app.globalData.mine_to_list) {
        //支付完成跳转到订单页标记
        app.globalData.mine_to_list = false;
        wx.showToast({
          title: '跳转到订单列表页',
          icon: 'loading',
          duration: 500
        });
        app.navigateTo(self, {
          url: '/pages/order_list/order_list',
        })
      }
      else {
        //普通打开 我的 页面
        self.fetch();
        // 页面初始化 options为页面跳转所带来的参数
      }
      
    }, function () {
      //失败
      wx.showToast({
        title: '数据加载失败',
        icon: 'loading',
        duration: 2000
      });
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
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
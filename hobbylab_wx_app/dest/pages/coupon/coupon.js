// pages/coupon/coupon.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fetch_lock: false,
    submit_lock: false,
    coupon_sn:"",//优惠券兑换码
    data_list_show:true,//列表数据层显示控制
    data_layer_show:false,//兑换弹框显示
    data_list:[],//数据存储数组
    coupon_type:'available',//选择的类型
    page: 1,//页码
    has_next_page:1

  },
  //切换顶部tag
  tag_click: function(event){
    var self = this;
    console.log("tag_click");
    console.log(event);
    var coupon_type = event.currentTarget.dataset.type;
    //设置数据
    self.setData({
      coupon_type: coupon_type,
      page:1,
      data_list:[],
      has_next_page:1
    });

    self.fetch();
  },
  //获取数据
  fetch:function(){
    var self = this;
    //检测是否获取数据被锁
    if (self.data.fetch_lock) {
      return;
    }
    //检测是否有下一页
    if (self.data.has_next_page!=1)
    {
      return;
    }

    //设置Loading
    wx.showToast({
      title: '获取优惠券',
      icon: 'loading',
      duration: 10000
    });
    self.data.fetch_lock = true;
    //加载数据
    app.util.yue_request({
      url: app.globalData.api_domain + '/coupon/get_coupon_list.php',
      data: {
        app_session: app.globalData.app_session,
        coupon_type: self.data.coupon_type,
        page: self.data.page
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res, resr) {
        // success
        wx.hideToast();
        console.log("提交成功");
        console.log(resr);
        var res_data = resr.data.result_data;
        console.log(res_data);

        if (res_data.data.length >= 0) {
          var render_list = self.data.data_list.concat(res_data.data);
          //根据返回是否有页码进行处理
          var has_next_page = res_data.has_next_page;
          self.data.has_next_page = has_next_page;
          if (has_next_page>0)
          {
            self.data.page = self.data.page+1;
          }
          //设置数据
          if (render_list.length<1)
          {
            self.setData({
              data_list_show:false,
              data_list:[]
            }, function () {
              wx.hideToast();
            });
          }
          else
          {
            self.setData({
              data_list_show: true,
              data_list: render_list
            });
          }
        }
        else {
          wx.hideToast();
          wx.showToast({
            title: '加载数据出错',
            icon: 'loading',
            duration: 1500
          });
        }
      },
      fail: function (res) {
        wx.hideToast();
        // fail
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
    });
  },
  //验证码输入
  coupon_sn_input:function(event){
    var self = this;
    console.log(event.detail.value);
    self.data.coupon_sn = event.detail.value;//存入数据
  },
  //点击兑换提交
  exchange_coupon_submit: function () {
    var self = this;
    console.log("exchange_coupon_submit");
    if (self.data.submit_lock) {
      return;
    }
    //检测兑换码
    var code_check = self.check_exit(self.data.coupon_sn);
    if (!code_check)
    {
      wx.showToast({
        title: '请输入兑换码',
        icon: 'loading',
        duration: 2000
      });
      return;
    }

    self.data.submit_lock = true;
    //提交数据
    app.util.yue_request({
      url: app.globalData.api_domain + '/coupon/exchange_coupon.php',
      data: {
        app_session: app.globalData.app_session,
        coupon_sn: self.data.coupon_sn
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res, resr) {
        wx.hideToast();
        // success
        console.log("提交成功");
        console.log(resr);
        var res_data = resr.data.result_data;
        console.log(res_data);
        if (res_data.data.result == "1") {
          //设置数据
          //提交成功后续操作
          wx.showToast({
            title: '兑换成功',
            icon: 'success',
            duration: 1500,
          });
          setTimeout(function () {
            self.setData({
              data_layer_show: false,
              coupon_sn: ""
            });

            //刷回可使用列表
            self.setData({
              coupon_type: 'available',
              page: 1,
              data_list: [],
              has_next_page: 1
            });
            //todo 获取收据
            wx.showToast({
              title: '获取优惠券',
              icon: 'loading',
              duration: 10000
            });
            self.fetch();
          }, 1500);
        }
        else {
          wx.showToast({
            title: res_data.data.message,
            icon: 'loading',
            duration: 1500
          });
        }
      },
      fail: function (res) {
        wx.hideToast();
        // fail
      },
      complete: function (res) {
        // complete
        self.data.submit_lock = false;
      }
    });
  },
  //显示兑换弹层
  layer_click: function (event){
    var self = this;
    console.log("layer_click");
    var data_layer_show = self.data.data_layer_show;
    if (!data_layer_show)
    {
      self.setData({
        data_layer_show: true
      });
    }
  },
  //隐藏弹层
  cancel_layer_click: function (event){
    var self = this;
    console.log("cancel_layer_click");
    var data_layer_show = self.data.data_layer_show;
    if (data_layer_show) {
      self.setData({
        data_layer_show: false,
        coupon_sn: ""
      });
    }
  },
  get_coupon_list:function(){
    var self = this;
    self.fetch();
  },
  //检查数据是否存在
  check_exit: function (input_value) {
    //检查备注是否有内容
    var exit_reg = new RegExp(/\S+/g);
    var exit_check = exit_reg.test(input_value);
    if (!exit_check) {
      return false;
    }
    else {
      return true;
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.get_window_info(this);
    // 页面初始化 options为页面跳转所带来的参数
    
    
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
      title: '我的优惠券'
    });
    app.ready(function () {
      self.fetch();
    }, function () {
      //失败
      wx.showToast({
        title: '数据加载失败',
        icon: 'loading',
        duration: 2000
      });
    })
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
//app.js
var util = require('/utils/util.js');
App({
  util: util,
  onLaunch: function (options) {
    //调用统计
    var that = this;
    //获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.systemInfo = res;
      }
    })
    //that.get_tap_window();
    //that.get_normal_window();
  },
  onShow: function (options) {
    // var path = options.path;
    // var query = options.query;
    // var open_num = options.scene;
    // console.log('onshow!')
    // console.log(options)
  },
  ready: function (cb, cb2) {
    //cb成功
    //cb2失败
    var that = this;
    that.get_app_session(cb, cb2);
  },
  get_app_session: function (cb, cb2) {
    var that = this;
    if (that.globalData.app_session) {
      //已获取登录状态
      typeof cb == "function" && cb(that.globalData)
    } else {
      wx.login({
        success: function (data) {
          console.log(data);
          var code = data.code;
          var encryptedData = '';
          var iv = '';
          wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 10000
          })
          wx.getUserInfo({
            withCredentials : true,
            success: function (resr) {
              // success
              console.log(resr);
              that.globalData.userInfo = resr.userInfo;
              encryptedData = resr.encryptedData;
              iv = resr.iv;
              that.util.yue_request({
                url: that.globalData.api_domain + '/app_login.php',
                data: {
                  encryptedData: encryptedData,
                  iv: iv,
                  code: code
                },
                header: {
                  'content-type': 'application/json'
                },
                success: function (r, res_2) {
                  that.globalData.app_session = res_2.data.result_data.result_data.app_session;
                  that.globalData.account_type = res_2.data.result_data.result_data.result;//2
                  that.globalData.cellphone = res_2.data.result_data.result_data.cellphone;
                  that.globalData.yue_login_id = res_2.data.result_data.result_data.user_id;

                  typeof cb == "function" && cb(that.globalData);
                  //荣少说 无用就不要管了 union_id 用于绑定手机
                  that.session_check(that.globalData.app_session);
                }
              })
            },
            fail: function (resr) {
              console.log(resr);
              // fail
              wx.showModal({
                title: '微信授权失败',
                content: '很可惜，微信授权失败，请稍后再尝试。线上购买服务均需要微信授权，若客观需要点单，请直接勾搭店小二吧！',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (ress) => {
                        /*
                         * res.authSetting = {
                         *   "scope.userInfo": true,
                         *   "scope.userLocation": true
                         * }
                         */
                        console.log(ress);
                        wx.reLaunch({
                          url: '/pages/index/index'
                        })
                      }
                    })
                  } else if (res.cancel) {
                  }
                }
              })
            },
            complete: function (resr) {
              // complete

            }
          })
        },
        fail: function (res) {
          // fail
          typeof cb2 == "function" && cb2(that.globalData);
        },
        complete: function (res) {
          // complete
          wx.hideToast();
        }
      })
    }
  },
  session_check: function (app_session, cb3) {
    console.log("in_check");
    var that = this;
    that.util.yue_request({
      url: that.globalData.api_domain + '/app_session.php',//https://yp.yueus.com/wx_snap/ajax/app_session.php',
      data: {
        app_session: app_session
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (r, res) {
        that.globalData.union_id = res.data.result_data.union_id;
        console.log('app_session');
        console.log(res);
        typeof cb3 == "function" && cb3(that.globalData)
      }
    })
  },
  get_tap_window: function () {
    try {
      var res = wx.getSystemInfoSync()
      this.globalData.tap_window_info = res;
    } catch (e) {
      // Do something when catch error
    }
    // wx.getSystemInfo({
    //   success: function (resr) {
    //     this.globalData.tap_window_info = resr;
    //   }
    // })
  },
  get_normal_window: function () {
    try {
      var res = wx.getSystemInfoSync()
      this.globalData.normal_window_info = res;
    } catch (e) {
      // Do something when catch error
    }
  },
  get_window_info: function (page) {
    var that = this;
    //获取当前页面的窗口信息，在每个page 调用
    wx.getSystemInfo({
      success: function (res) {
        page.setData({
          window: res
        })
      }
    })
  },
  reset_seat_info : function(options){
    var that = this;
    console.log('in_reset');
    delete that.globalData.seat_info.id;
    delete that.globalData.seat_info.name;
    return that.globalData.seat_info;
  },
  globalData: {
    api_domain: 'https://hobbylab.yueus.com/wx_api_v_1_1',//'https://mojikids.yueus.com/wx_api',//,
    userInfo: null, //账户信息
    app_session: null,
    systemInfo: null,//设备信息
    cart_data: {},
    seat_info: {},
    nav_cache: {
      goods_details: null,
      order_list: null
    },
    tap_window_info: {},
    normal_window_info: {},
    pages_status : {
      index:{
        onload : null,
        onReady : null
      }
    },
    mine_to_list : false //支付成功跳转到我的，打开列表页
  },
  stack: function (arr) {
    var that = this;
    try {
      for (var i = arr.length; i = 0; i--) {
        var a = { [arr[arr.length - 1]]: {} }
        var a = { [arr[i]]: {} }

      }
      that.globalData.cart_data[arr[0]];
    }
    catch (e) {
      that.globalData.cart_data[arr[0]] = ''
    }
    that.stack(arr.shift())
  },
  set_cart: function (options) {
    //设置数量
    var that = this;
    var type_id = options.type_id;
    var classify_id = options.classify_id;
    var goods_id = options.goods_id;
    var standard_id = options.standard_id;
    var control = options.control;
    try {
      if (control == 'plus') {
        if (typeof that.globalData.cart_data[type_id][classify_id][goods_id][standard_id] == 'number') {
          that.globalData.cart_data[type_id][classify_id][goods_id][standard_id]++;
        }
        else {
          that.globalData.cart_data[type_id][classify_id][goods_id][standard_id] = 1;
        }

      }
      else if (control == 'zero') {
        if (typeof that.globalData.cart_data[type_id][classify_id][goods_id][standard_id] == 'number') {
          that.globalData.cart_data[type_id][classify_id][goods_id][standard_id] = 0;
        }
      }
      else {
        if (that.globalData.cart_data[type_id][classify_id][goods_id][standard_id] > 0) {
          that.globalData.cart_data[type_id][classify_id][goods_id][standard_id]--;
        }

      }
    }
    catch (e) {
      try {
        that.globalData.cart_data[type_id][classify_id][goods_id] = { [standard_id]: 1 };
      }
      catch (e) {
        try {
          that.globalData.cart_data[type_id][classify_id] = { [goods_id]: { [standard_id]: 1 } };
        }
        catch (e) {
          that.globalData.cart_data[type_id] = { [classify_id]: { [goods_id]: { [standard_id]: 1 } } };
        }
      }
    }
    return that.globalData.cart_data
  },
  count_num: function (pkg) {
    //计算层级总数
    var that = this;
    var num = that.stack(pkg);
    return num
  },
  stack: function (pkg) {
    //迭代方法
    var that = this;
    var temp = 0;
    for (var i in pkg) {
      if (typeof pkg[i] == 'number') {
        temp = temp + pkg[i];
      }
      else {
        temp = temp + that.stack(pkg[i])
      }
    }
    return temp
  },
  go_to_cart: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/cart2/cart2',
      success: function (res) {
        // success
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })
  },
  navigateTo: function (page, options) {
    var url = options.url || '',
      page = page || {},
      success = options.success || function () { },
      fail = options.fail || function () { },
      complete = options.complete || function () { };

    if (!page.data.navigating) {
      wx.navigateTo({
        url: url,
        success: function (e) {
          console.log(e);
          if (typeof success == 'function') { success.call(page, e) }
        },
        fail: function (e) {
          if (typeof fail == 'function') { fail.call(page, e) }
        },
        complete: function (e) {
          if (typeof complete == 'function') { complete.call(page, e) }
        }
      })
    }
    page.setData({
      navigating: true
    })
    setTimeout(function () {
      page.setData({
        navigating: false
      })
    }, 1000)
  },
  redirectTo: function (page, options) {
    var url = options.url || '',
      page = page || {},
      success = options.success || function () { },
      fail = options.fail || function () { },
      complete = options.complete || function () { };

    if (!page.data.redirecting) {
      wx.redirectTo({
        url: url,
        success: function (e) {
          console.log(e);
          if (typeof success == 'function') { success.call(page, e) }
        },
        fail: function () {
          if (typeof fail == 'function') { fail.call(page, e) }
        },
        complete: function (e) {
          if (typeof complete == 'function') { complete.call(page, e) }
        }
      })
    }
    page.setData({
      redirecting: true
    })
    setTimeout(function () {
      page.setData({
        redirecting: false
      })
    }, 1000)
  }
})
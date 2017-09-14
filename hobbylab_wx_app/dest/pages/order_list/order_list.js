// pages/order_list/order_list.js
var app = getApp();
Page({
  data: {
    window: {
      windowHeight: 800
    },
    taps: [{ name: '全部订单', types: 'all' }, { name: '待评价', types: 'appraise' }],
    cur_tap: 0,
    page: 1,
    list: [],
    has_next: true,
    fetching: false,
    empty_show: 0,
    scrollTop : 0
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    
    app.ready(function () {
      that.fetch('click');
    }, function () { })
    console.log(that.data.window);
    app.globalData.seat_info.enter = 'scan';
  },
  onReady: function () {
    // 页面渲染完成
    app.get_window_info(this);
    app.globalData.seat_info.enter = 'scan';
  },
  onShow: function () {
    app.globalData.seat_info.enter = 'scan';
    var that = this;
    app.get_window_info(this);
    console.log('order_list in onshow');
    console.log(this.data.window);
    // 页面显示
    if (app.globalData.nav_cache.order_list) {
      console.log('fetch')
      that.fresh_back()
      app.globalData.nav_cache.order_list = null
    }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  fresh_back: function () {
    var that = this;
    var idx = that.data.cur_tap;
      that.setData({
        page: 1
      })
    that.fetch('click');
  },
  switchs: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    that.setData({
      page: 1
    })
    that.setData({
      cur_tap: index
    })
    that.fetch('click');
  },
  fetch: function (types) {
    var that = this;
    if (that.data.fetching) return
    that.setData({
      fetching: true
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    // if (types == 'click') {
    //   that.setData({
    //     page: 1,
    //     list: []
    //   })
    // }
    // else{

    // }
    app.util.yue_request({
      url: app.globalData.api_domain + '/order_list/order_list.php',
      data: {
        app_session: app.globalData.app_session,
        location_id: '',
        trade_type: that.data.taps[that.data.cur_tap].types,
        page: that.data.page,
        cur_tap: that.data.cur_tap
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (resr,res) {
        // success
        console.log(res);

        var d = res.data.result_data.data;
        if (types == 'click') {
          that.setData({
            page: ++that.data.page,
            list: d.list,
            has_next: d.has_next_page
          })
          if (d.list.length == 0) {
            that.setData({
              empty_show: 1
            })
          }
          else{
            that.setData({
              empty_show: 0
            })
          }
          that.setData({
            scrollTop : 0
          })
        }
        else if (types == 'roll') {
          that.setData({
            page: ++that.data.page,
            list: that.data.list.concat(d.list),
            has_next: d.has_next_page
          })
        }

        wx.setNavigationBarTitle({
          title: d.title
        })
      },
      fail: function (resr,res) {
        // fail
      },
      complete: function (resr,res) {
        // complete 
        that.setData({
          fetching: false
        })
        wx.hideToast();
      }
    })
  },
  actions: function (e) {
    var that = this;
    var action = e.currentTarget.dataset.action;
    var order_sn = e.currentTarget.dataset.ordersn;
    console.log(e);
    switch (action) {
      case 'pay': that.get_pack(order_sn); break;
      case 'appraise':
        if (!that.data.navigating) {
          wx.navigateTo({
            url: '/pages/comment/comment?order_sn=' + order_sn,
          })
          that.setData({
            navigating: true
          })
          setTimeout(function () {
            that.setData({
              navigating: false
            })
          }, 1000)
        }; break;
    }
  },
  go_to_seller: function (e) {
    //避免路由爆了 CT说不让跳转到商家
    return
    var seller_id = e.currentTarget.dataset.sid;
    var that = this;
    if (!that.data.navigating && app.globalData.seat_info.id) {
      wx.navigateTo({
        url: '/pages/store/store?seller_id=' + seller_id,
      })
      that.setData({
        navigating: true
      })
      setTimeout(function () {
        that.setData({
          navigating: false
        })
      }, 1000)
    }
  },
  get_pack: function (order_sn) {
    var that = this;
    if (that.data.fetching) return
    that.setData({
      fetching: true
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 20000
    })
    app.util.yue_request({
      url: app.globalData.api_domain + '/order_list/get_payment.php',
      data: {
        app_session: app.globalData.app_session,
        order_sn: order_sn
      }, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (resr,res) {
        // success
        console.log(res);
        var payment = JSON.parse(res.data.result_data.data.data.bank_request_data);
        console.log(payment);
        wx.requestPayment({
          'timeStamp': payment.timeStamp,
          'nonceStr': payment.nonceStr,
          'package': payment.package,
          'signType': payment.signType,
          'paySign': payment.paySign,
          'success': function (res) {
            var status = res.errMsg;
            if (status == "requestPayment:ok") {
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000
              })
            }
            that.setData({
              page: 1,
              cur_tap : 1
            })

            that.fetch('click');
          },
          'fail': function (res) {
            wx.showModal({
              title: '提示',
              content: '支付失败',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                } else if (res.cancel) {
                }
              }
            })
          }
        })
      },
      fail: function (resr,res) {
        // fail
        wx.showModal({
          title: '提示',
          content: '订单提交失败，请检查网络',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
            } else if (res.cancel) {
            }
          }
        })
      },
      complete: function (resr,res) {
        // complete
        wx.hideToast()
        that.setData({
          fetching: false
        })
      }
    })
  },
  index_bot: function () {
    console.log(21321312123);
    var that = this;
    if (that.data.has_next) {
      that.fetch('roll');
    }
  }
})
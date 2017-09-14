// pages/index/index.js
var app = getApp();
Page({
  data: {
    list: [],
    windowHeight: app.globalData.systemInfo.windowHeight,
    windowWidth: app.globalData.systemInfo.windowWidth,
    page_title: '爱好研究所',
    fetch_finish: false,
    go_to_store: 0
  },
  onLoad: function (options) {
    var that = this;
    //拉取数据
    app.ready(function () {
      that.fetch();
    })
    //设置标题

    //获取window信息
    app.get_window_info(this);

    if (JSON.stringify(options) == '{}') {
      options = app.globalData.seat_info
    }
    //微信二维码进
    that.control_options(options, 'normal_open');
  },
  set_desk: function () {
    var that = this;
    if (app.globalData.seat_info.id) {
      that.setData({
        desk: '所在位置：' + app.globalData.seat_info.name
      })
    } else {
      that.setData({
        desk: '咦，没找到你在哪，快来扫扫码'
      })
    }
  },
  onReady: function () {
    // 页面渲染完成
    var that = this;
    if (that.data.go_to_store) {
      wx.showToast({
        title: '跳转商家中',
        icon: 'loading',
        duration: 10000
      })
      that.setData({
        go_to_store: 0
      })
      setTimeout(function () {
        app.navigateTo(that, {
          url: '/pages/store/store?id=' + app.globalData.seat_info.id,
        })
      }, 1200)
      wx.hideToast()
    }
  },
  onShow: function (op) {
    var that = this;
    // 页面显示
    wx.setNavigationBarTitle({
      title: that.data.page_title
    })
    that.set_desk();
    if (that.data.fetch_finish) that.add_num()
  },
  add_num: function () {
    var that = this;
    // 加红点
    var res = app.globalData.cart_data;
    var temp = that.data.list;
    for (var i = 0; i < temp.length; i++) {
      var pkg = res[temp[i].type_id];
      temp[i].t_num = app.count_num(pkg);
      that.setData({
        list: temp
      })
    }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  nev_to: function (e) {
    var that = this;
    //无门店id
    if (!app.globalData.seat_info.place_store_id || !app.globalData.seat_info.id) {
      wx.showModal({
        title: '提示',
        content: '没有找到你的位置，请扫码告诉我吧',
        success: function (res) {
          if (res.confirm) {
            that.scan();
          } else if (res.cancel) {
          }
        }
      })
    }

    if (app.globalData.seat_info.place_store_id && app.globalData.seat_info.id) {
      var type_id = e.currentTarget.dataset.type;
      var large_showcase = e.currentTarget.dataset.open;
      var url = '';
      if (large_showcase == "1") {
        url = '/pages/goods_list_big/goods_list_big?type=' + type_id
      }
      else {
        url = '/pages/goods_list/goods_list?type=' + type_id
      }
      app.navigateTo(that, {
        url: url,
      })
    }

    /********* 
     * 解开扫码限制
    
    var that = this;
    var type_id = e.currentTarget.dataset.type;
    var large_showcase = e.currentTarget.dataset.open;
    var url = '';
    if (large_showcase == "1") {
      url = '/pages/goods_list_big/goods_list_big?type=' + type_id
    }
    else {
      url = '/pages/goods_list/goods_list?type=' + type_id
    }
    app.navigateTo(that, {
      url: url,
    })
    */

  },
  fetch: function () {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    app.util.yue_request({
      url: app.globalData.api_domain + '/index/index.php',
      data: {
        app_session: app.globalData.app_session
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res, resr) {
        // success
        that.setData({
          list: resr.data.result_data.data.list,
          fetch_finish: true
        })
        that.add_num()
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
        wx.hideToast();
      }
    })
  },
  scan: function () {
    var that = this;
    wx.scanCode({
      success: (res) => {
        console.log(res);
        var obj = app.util.parse_path(res.path);
        console.log(obj);
        //首页内触发扫码
        that.control_options(obj, 'scan_open');
      },
      fail: (res) => {

      }
    })
  },
  control_options: function (options, types) {
    var that = this;
    if (types == 'scan_open') {
      if (options.id) {
        app.globalData.seat_info.action = options.action;
        app.globalData.seat_info.seat_type = options.seat_type;
        app.globalData.seat_info.place_store_id = options.place_store_id;
        app.globalData.seat_info.id = options.id;
        app.globalData.seat_info.name = options.name;
        that.set_desk();

        if (app.globalData.seat_info.seat_type == 2) {
          wx.showToast({
            title: '跳转商家中',
            icon: 'loading',
            duration: 10000
          })
          that.setData({
            go_to_store: 0
          })
          setTimeout(function () {
            app.navigateTo(that, {
              url: '/pages/store/store?id=' + app.globalData.seat_info.id,
            })
          }, 1200)
          wx.hideToast()
        }
      } else {
        wx.showModal({
          title: '提示',
          content: '请扫正确的二维码(木有id)',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    }
    else if (types == 'normal_open') {
      app.globalData.seat_info.action = options.action;
      app.globalData.seat_info.seat_type = options.seat_type;
      app.globalData.seat_info.place_store_id = options.place_store_id;
      app.globalData.seat_info.id = options.id;
      app.globalData.seat_info.name = options.name;
      //测试数据 id=3&name=S-A003
      // app.globalData.seat_info = {
      //   seat_type: '1',
      //   place_store_id: '1',
      //   id: '18',
      //   name: '55655',
      //   enter: 'list' //'scan' 'list'
      // }

      that.set_desk();

      if (app.globalData.seat_info.seat_type == '2') {
        //'scan'并不代表扫码进来，而是seat_type=2的意思
        app.globalData.seat_info.enter = 'scan';
        //座位id
        that.setData({
          go_to_store: 1
        })
        console.log(11)
      }
      else {
        console.log(22)
        app.globalData.seat_info.enter = 'list';
      }
    }
    else {

    }
  },
  onShareAppMessage: function () {
    return {
      title: '爱好研究所',
      path: '/pages/index/index',
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  }
})
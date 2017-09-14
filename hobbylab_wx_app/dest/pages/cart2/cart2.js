// pages/cart2/cart2.js
var app = getApp();
Page({
  data: {
    window: {
      windowHeight: 800
    },
    fetching: false,
    cart_null: false,
    moves :{
      start_x : 0,
      start_y : 0,
      end_x : 0,
      end_y : 0
    }
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
  scan: function () {
    var that = this;
    return;
    wx.scanCode({
      success: (res) => {
        var obj = app.util.parse_path(res.path);
        console.log(obj);
        that.control_options(obj, 'scan_open');
      },
      fail: (res) => {

      }
    })
  },
  onLoad: function (options) {
    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    //window为保留字
    
    wx.setNavigationBarTitle({
      title: '购物车'
    })

    that.set_desk();
  },
  move_start : function(e){
    var that = this;
    var temp = that.data.moves;
    temp.start_x = e.changedTouches[0].clientX;
    temp.start_y = e.changedTouches[0].clientY;
    that.setData({
      moves : temp
    })
  },
  move_end : function(e){
    console.log(e);
    var that = this;
    var temp = that.data.moves;
    temp.end_x = e.changedTouches[0].clientX;
    temp.end_y = e.changedTouches[0].clientY;
    that.setData({
      moves : temp
    })
    var idx = e.currentTarget.dataset.idx;
    var index = e.currentTarget.dataset.index;
    var lists = that.data.list;
    if((temp.start_x - temp.end_x)>80){
      console.log("show");
      lists[index].goods[idx].show_deletes = true
      that.setData({
        list : lists
      })
    }
    if((temp.end_x - temp.start_x)>80){
      console.log("show");
      lists[index].goods[idx].show_deletes = false
      that.setData({
        list : lists
      })
    }
  },
  deletes : function(e){
    var that = this;
    var types = 'zero';
    var goods_id = e.currentTarget.dataset.gid;
    var classify_id = e.currentTarget.dataset.cid;
    var type_id = e.currentTarget.dataset.tid;
    var standard_id = e.currentTarget.dataset.sid;
    var findex = e.currentTarget.dataset.findex;
    var cindex = e.currentTarget.dataset.cindex;

    var res = app.set_cart({
      control: types,
      type_id: type_id,
      classify_id: classify_id,
      goods_id: goods_id,
      standard_id: standard_id
    })

    that.fetch();
    var pkg = res;
    var pkg_4 = res[type_id][classify_id][goods_id][standard_id];

    var temp = that.data.list;

    temp[findex].goods[cindex].quantity = pkg_4;

    that.setData({
      list: temp
    })
  },
  onReady: function () {
    // 页面渲染完成
    app.get_window_info(this);
  },
  onShow: function () {
    var that = this;
    // 页面显示
    if (app.count_num(app.globalData.cart_data) == 0) {
      that.setData({
        cart_null: true
      })
      console.log(app.globalData.cart_data)
    }
    app.ready(function () {
      if (app.count_num(app.globalData.cart_data) != 0){
        that.fetch();
      }
    }, function () {

    })
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  go_to_order: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/submit_order/submit_order',
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
  fetch: function () {
    var that = this;
    if (that.data.fetching) return
    that.data.fetching = true;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    app.util.yue_request({
      url: app.globalData.api_domain + '/cart2/cart2.php',
      data: {
        app_session: app.globalData.app_session,
        cart_data: app.globalData.cart_data
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (resr,res) {
        // success
        //设置初始化值
        console.log(res);
        if (res.data.result_data.data.result < 1) {
          that.setData({
            cart_null: true,
            total_amount: 0
          })
        }
        else {
          that.setData({
            cart_null: false,
            list: res.data.result_data.data.list,
            total_amount: res.data.result_data.data.total_amount
          })
        }
      },
      fail: function (resr,res) {
        // fail
      },
      complete: function (resr,res) {
        // complete
        that.data.fetching = false
        wx.hideToast();
      }
    })
  },
  cart: function (e) {
    var that = this;
    var types = e.currentTarget.dataset.con;
    var goods_id = e.currentTarget.dataset.gid;
    var classify_id = e.currentTarget.dataset.cid;
    var type_id = e.currentTarget.dataset.tid;
    var standard_id = e.currentTarget.dataset.sid;
    var findex = e.currentTarget.dataset.findex;
    var cindex = e.currentTarget.dataset.cindex;

    var res = app.set_cart({
      control: types,
      type_id: type_id,
      classify_id: classify_id,
      goods_id: goods_id,
      standard_id: standard_id
    })

    that.fetch();
    var pkg = res;
    var pkg_4 = res[type_id][classify_id][goods_id][standard_id];

    var temp = that.data.list;

    temp[findex].goods[cindex].quantity = pkg_4;

    that.setData({
      list: temp
    })

    // 查询
    // var pkg = res[type_id];
    // var pkg_2 = res[type_id][classify_id];
    // var pkg_3 = res[type_id][classify_id][goods_id];

    // var num = app.count_num(pkg);
    // var num2 = app.count_num(pkg_2);
    // var num3 = app.count_num(pkg_3);
    // console.log(num);
    // console.log(num2);
    // console.log(num3);
  },
  choosen: function (e) {
    var that = this;
    wx.navigateTo({
      url: '/pages/submit_order/submit_order',
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
  }
})
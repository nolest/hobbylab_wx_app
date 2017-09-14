// pages/goods_list_big/goods_list_big.js
var app = getApp();
Page({
  data: {
    cart: '/image/goods_list_big/cart_60x60.png',
    cart_cur: '/image/goods_list_big/cart_60x60_cur.png',
    num: 0,
    type_id: '',
    filter: [],
    current_filter: 0,
    current_filter_child :0,
    filter_str : '',
    list: [],
    window: {
      windowHeight: 800
    },
    total_num: 0,
    standard_fade: 0,
    fetch_finish: false,
    empty_show: 0,
    fetching : false,
    scroll_offset :94
  },
  onLoad: function (options) {
    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    //window为保留字
    app.get_window_info(this);
    that.setData({
      type_id: options.type
    })
    wx.setNavigationBarTitle({
      title: '玩 · 课堂'
    })
    //扫码进商家页后返回从列表进detail，修复状态
    app.globalData.seat_info.enter = 'list';
  },
  go_to_details: function (e) {
    var that = this;
    var g = e.currentTarget.dataset.goodsid;
    var stage = e.currentTarget.dataset.stageid;
    var url = '/pages/goods_details/goods_details?goods_id=' + g;
    if (stage) {
      url = url + '&stageid=' + stage;
    }
    if (!that.data.navigating) {
      wx.navigateTo({
        url: url,
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
  onReady: function () {
    var that = this;
    // 页面渲染完成
    that.fetch();
  },
  onShow: function () {
    var that = this;
    if (that.data.fetch_finish) that.add_num();

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  fetch: function (filter) {
    console.log(filter);
    var that = this;
    if (that.data.fetching){
      return
    }
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    that.setData({
      filter_str : filter,
      scroll_offset : that.data.current_filter == 0 ? 94 : 50 //94 : 50
    })
    app.util.yue_request({
      url: app.globalData.api_domain + '/goods_list_big/goods_list_big.php',
      data: {
        app_session: app.globalData.app_session,
        type_id: that.data.type_id,
        place_id: app.globalData.seat_info.place_store_id,
        filter: filter ? filter : ''
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (r,res) {
        // success
        console.log(res)
        //that.set_data(res);
        var list = res.data.result_data.data.list;
        var filter = res.data.result_data.data.filter;
        that.setData({
          filter: filter,
          list: list,
          fetch_finish: true
        });
        that.add_num();
        if (that.data.list.length == 0 && list.length == 0) {
          that.setData({
            empty_show: 1
          })
        }
        else{
          that.setData({
            empty_show: 0
          })
        }
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
        wx.hideToast();
        that.setData({
          fetching : false
        })
      }
    })
  },
  add_num: function () {

    var that = this;
    // 页面显示 计算商品数量
    var res = app.globalData.cart_data;
    var temp = that.data.list;
    for (var i in temp) {
      var t = temp[i].type_id;
      var c = temp[i].classify_id;
      var g = temp[i].goods_id;
      var num = 0;
      try {
        num = app.count_num(res[t][c][g]);
        temp[i].g_num = num;
        var num_2 = 0;
        for (var j in temp[i].standard) {
          var s = temp[i].standard[j].standard_id;
          num_2 = res[t][c][g][s];
          if (typeof num_2 == 'number') temp[i].standard[j].g_num = num_2;
        }
      }
      catch (e) {
        console.log(e);
      }
    }
    that.setData({
      list: temp,
      total_num: app.count_num(res)
    })
  },
  choosen: function (e) {
    var that = this;
    if (that.data.total_num) {
      app.go_to_cart();
    }
  },
  go_to_cart: function () {
    var that = this;
    if (!that.data.navigating) {
      wx.navigateTo({
        url: '/pages/cart2/cart2',
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
  choose: function (e) {
    var that = this;
    var goods_id = e.currentTarget.dataset.gid;
    var classify_id = e.currentTarget.dataset.cid;
    var type_id = e.currentTarget.dataset.tid;
    var standard_id = e.currentTarget.dataset.sid;
    var itemidx = e.currentTarget.dataset.itemidx;

    //初始化弹层逻辑
    var temp = that.data.list[itemidx];
    if (temp.is_mine == "1") {
      wx.showModal({
        title: '提示',
        content: '很抱歉，你不可以购买自己的商品',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    var some_num = false;
    var standard_now = {
      t_id: type_id,
      c_id: classify_id,
      g_id: goods_id,
      s_id: standard_id,
      idx: itemidx,
      index: 0
    }
    //是否存在已选
    var has_g_num = false;
    for (var i in temp.standard) {
      if (temp.standard[i].g_num) {
        //存在
        standard_now.index = i;
        has_g_num = true;
        break;
      }
    }
    if (!has_g_num) {
      //不存在
      for (var k in temp.standard) {
        //选上有库存的最前一个
        if (temp.standard[k].stock_num != 0) {
          standard_now.index = k;
          some_num = true;
          break;
        }
      }
    }

    that.setData({
      some_num: some_num
    })

    if (has_g_num || some_num) {
      that.setData({
        standard_fade: 1,
        standard_now: standard_now
      })
    }
    else {
      wx.showModal({
        title: '提示',
        content: '所有规格都卖光了',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {

          }
        }
      })
    }
  },
  hide_standard_fade: function () {
    var that = this;
    that.setData({
      standard_fade: 0
    })
  },
  cart: function (e) {
    var that = this;
    var types = e.currentTarget.dataset.con;
    var goods_id = e.currentTarget.dataset.gid;
    var classify_id = e.currentTarget.dataset.cid;
    var type_id = e.currentTarget.dataset.tid;
    var standard_id = e.currentTarget.dataset.sid;
    var itemidx = e.currentTarget.dataset.itemidx;

    var temp = that.data.list;
    if (types == 'plus' && temp[itemidx].standard[0].g_num >= temp[itemidx].standard[0].stock_num || temp[itemidx].standard[0].stock_num == 0) {
      //库存量少于可选数 或 库存量为0
      wx.showModal({
        title: '提示',
        content: '超出库存',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
          }
        }
      })
      return
    }

    var res = app.set_cart({
      control: types,
      type_id: type_id,
      classify_id: classify_id,
      goods_id: goods_id,
      standard_id: standard_id
    })

    var pkg = res;
    var pkg_3 = res[type_id][classify_id][goods_id];
    var pkg_4 = res[type_id][classify_id][goods_id][standard_id];


    temp[itemidx].g_num = app.count_num(pkg_3);
    temp[itemidx].standard[0].g_num = pkg_4;
    that.setData({
      list: temp,
      total_num: app.count_num(pkg)
    })

    console.log(app.globalData.cart_data);
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
  tap_standard: function (e) {
    var that = this;
    var s_index = e.currentTarget.dataset.stand;
    var stock = e.currentTarget.dataset.stock;
    var temp = that.data.standard_now;
    temp.index = s_index;
    if (stock != 0) {
      that.setData({
        standard_now: temp
      })
    }
  },
  cart_s: function (e) {
    var that = this;
    var types = e.currentTarget.dataset.con;
    var goods_id = e.currentTarget.dataset.gid;
    var classify_id = e.currentTarget.dataset.cid;
    var type_id = e.currentTarget.dataset.tid;
    var standard_id = e.currentTarget.dataset.sid;
    var itemidx = e.currentTarget.dataset.itemidx;
    var itemindex = e.currentTarget.dataset.itemindex;

    var temp = that.data.list;

    if (types == 'plus' && temp[itemidx].standard[itemindex].g_num >= temp[itemidx].standard[itemindex].stock_num) {
      //库存量
      wx.showModal({
        title: '提示',
        content: '超出库存',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
          }
        }
      })
      return
    }


    var res = app.set_cart({
      control: types,
      type_id: type_id,
      classify_id: classify_id,
      goods_id: goods_id,
      standard_id: standard_id
    })

    var pkg = res;
    var pkg_3 = res[type_id][classify_id][goods_id];
    var pkg_4 = res[type_id][classify_id][goods_id][standard_id];


    temp[itemidx].g_num = app.count_num(pkg_3);
    temp[itemidx].standard[itemindex].g_num = pkg_4;

    that.setData({
      list: temp,
      total_num: app.count_num(pkg)
    })
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
  },
  choose_fil_first : function(e){
    var that = this;
    if (that.data.fetching) {
      return
    }
    console.log(e)
    var index = e.currentTarget.dataset.index;
    var fil = e.currentTarget.dataset.fil;
    console.log(index);
    console.log(fil);
    that.setData({
      current_filter: index,
      list : []
    })
    that.fetch(fil ? fil:'');
  },
  choose_fil_second : function(e){
    var that = this;
    if (that.data.fetching) {
      return
    }
    console.log(e)
    var index = e.currentTarget.dataset.index;
    var fil = e.currentTarget.dataset.fil;
    console.log(index);
    console.log(fil);
    that.setData({
      current_filter_child: index,
      list: []
    })
    that.fetch(fil ? fil : '');
  },
  unchoosable : function(){
    var that = this;
    console.log('nothing')
  }
})
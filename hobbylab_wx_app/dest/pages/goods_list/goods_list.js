// pages/goods_list/goods_list.js
var app = getApp();
Page({
  data: {
    type_id: '',
    cart: '/image/goods_list/cart_60x60.png',
    cart_cur: '/image/goods_list/cart_60x60_cur.png',
    cur_type: '',
    cur_index: 0,
    window: {
      windowHeight: 800
    },
    title_info: {},
    total_num: 0,
    fetch_finish: false,
    standard_fade: 0,
    standard_now: {
      t_id: '',
      c_id: '',
      g_id: '',
      s_id: '',
      idx: '',
      index: 0
    },
    fetching: false
  },
  onLoad: function (options) {
    var that = this;
    app.get_window_info(this);
    // 页面初始化 options为页面跳转所带来的参数
    that.setData({
      type_id: options.type
    })
    //window为保留字

    that.fetch();
    //扫码进商家页后返回从列表进detail，修复状态
    app.globalData.seat_info.enter = 'list';
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    var that = this;
    if (that.data.fetch_finish) that.add_num();
  },
  onHide: function () {
    var that = this;
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
    console.log('onUnload');
  },
  add_num: function () {

    var that = this;
    // 页面显示 计算商品数量
    var res = app.globalData.cart_data;
    var temp = that.data.list;
    for (var i in temp) {
      for (var k in temp[i].goods) {
        var t = temp[i].goods[k].type_id;
        var c = temp[i].goods[k].classify_id;
        var g = temp[i].goods[k].goods_id;
        var num = 0;
        try {
          num = app.count_num(res[t][c][g]);
          temp[i].goods[k].g_num = num;
          var num_2 = 0;
          for (var j in temp[i].goods[k].standard) {
            var s = temp[i].goods[k].standard[j].standard_id;
            num_2 = res[t][c][g][s];
            if (typeof num_2 == 'number') temp[i].goods[k].standard[j].g_num = num_2;
          }
        }
        catch (e) {
          console.log(e);
        }
      }
    }
    that.setData({
      list: temp,
      total_num: app.count_num(res)
    })
  },
  fetch: function () {
    var that = this;
    console.log(app.globalData.seat_info);
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    app.util.yue_request({
      url: app.globalData.api_domain + '/goods_list/goods_list.php',
      data: {
        app_session: app.globalData.app_session,
        type_id: that.data.type_id,
        place_id: app.globalData.seat_info.place_store_id
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (resr,res) {
        // success
        //设置初始化值
        that.set_data(res);
        app.globalData.test_cache = res;
        wx.setNavigationBarTitle({
          title: that.data.title
        })
        that.setData({
          fetch_finish: true
        })
        that.add_num();
      },
      fail: function (resr,res) {
        // fail
      },
      complete: function (resr,res) {
        // complete
        wx.hideToast();
      }
    })
  },
  index_bot: function () {
    console.log('123')
    var that = this;
    if (!(that.data.list[that.data.cur_index].has_next == false)) {
      that.fetch_classify();
    }
  },
  fetch_classify: function () {
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
    app.util.yue_request({
      url: app.globalData.api_domain + '/goods_list/goods_list_classify.php',
      data: {
        app_session: app.globalData.app_session,
        type_id: that.data.type_id,
        place_id: app.globalData.seat_info.place_store_id,
        classify_id: that.data.cur_type,
        page: !that.data.list[that.data.cur_index].page ? '2' : that.data.list[that.data.cur_index].page
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (resr,res) {
        var temp = that.data.list;
        temp[that.data.cur_index].goods = res.data.result_data.data.page == "1" ? res.data.result_data.data.list : temp[that.data.cur_index].goods.concat(res.data.result_data.data.list);
        temp[that.data.cur_index].has_next = res.data.result_data.data.has_next_page;
        temp[that.data.cur_index].page = ++res.data.result_data.data.page + ''
        that.setData({
          list: temp
        })
        that.add_num();
        // success
        //设置初始化值
        // that.set_data(res);
        // app.globalData.test_cache = res;
        // wx.setNavigationBarTitle({
        //   title: that.data.title
        // })
        // that.setData({
        //   fetch_finish : true
        // })
        // that.add_num();
        console.log(res);
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
  set_data: function (res) {
    var that = this;
    console.log(that.data.cur_type, res.data.result_data.data)
    that.setData({
      list: res.data.result_data.data.list,
      cur_type: that.data.cur_type || res.data.result_data.data.list[0].classify_id,
      title: res.data.result_data.data.title,
      title_info: res.data.result_data.data.type,
      banner: res.data.result_data.data.banner
    })
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
  go_to_details: function (e) {
    var that = this;
    var a = e.currentTarget.dataset.goodsid;
    if (!that.data.navigating) {
      wx.navigateTo({
        url: '/pages/goods_details/goods_details?goods_id=' + a,
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
  tap_class: function (e) {
    var that = this;
    if (that.data.fetching) return
    var index = e.currentTarget.dataset.index;
    that.setData({
      cur_type: that.data.list[index].classify_id,
      cur_index: index
    })
    var temp = that.data.list;
    temp[that.data.cur_index].page = 1;
    temp[that.data.goods] = [];
    temp[that.data.cur_index].has_next = true;
    that.setData({
      list: temp
    })
    that.fetch_classify()
  },
  choose: function (e) {
    var that = this;
    var goods_id = e.currentTarget.dataset.gid;
    var classify_id = e.currentTarget.dataset.cid;
    var type_id = e.currentTarget.dataset.tid;
    var standard_id = e.currentTarget.dataset.sid;
    var itemidx = e.currentTarget.dataset.itemidx;

    //初始化弹层逻辑
    var temp = that.data.list[that.data.cur_index].goods[itemidx];
    console.log(temp);
    if (temp.is_mine == "1") {
      wx.showModal({
        title: '提示',
        content: '很抱歉，你不可以购买自己的商品',
        showCancel : false,
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
  choosen: function (e) {
    var that = this;
    if (that.data.total_num) {
      app.go_to_cart();
    }
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
    if (types == 'plus' && temp[that.data.cur_index].goods[itemidx].standard[0].g_num >= temp[that.data.cur_index].goods[itemidx].standard[0].stock_num || temp[that.data.cur_index].goods[itemidx].standard[0].stock_num == 0) {
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

    temp[that.data.cur_index].goods[itemidx].g_num = app.count_num(pkg_3);
    temp[that.data.cur_index].goods[itemidx].standard[0].g_num = pkg_4;
    that.setData({
      list: temp,
      total_num: app.count_num(pkg)
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
    if (types == 'plus' && temp[that.data.cur_index].goods[that.data.standard_now.idx].standard[that.data.standard_now.index].g_num >= temp[that.data.cur_index].goods[that.data.standard_now.idx].standard[that.data.standard_now.index].stock_num) {
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


    temp[that.data.cur_index].goods[itemidx].g_num = app.count_num(pkg_3);
    temp[that.data.cur_index].goods[itemidx].standard[itemindex].g_num = pkg_4;

    that.setData({
      list: temp,
      total_num: app.count_num(pkg)
    })
  },
  nothing: function () {
    //点击空白位置
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
  hide_standard_fade: function () {
    var that = this;
    that.setData({
      standard_fade: 0
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
  }
})
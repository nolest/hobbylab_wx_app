// pages/goods_details/goods_details.js
var WxParse = require('../../utils/wxParse_v2/wxParse.js');
var app = getApp();
Page({
  data: {
    goods_id: '',
    info: {},
    window: {
      windowHeight: 800
    },
    cart: '/image/goods_details/cart_60x60.png',
    cart_cur: '/image/goods_details/cart_60x60_cur.png',
    autoplay: false,
    interval: 3500,
    duration: 800,
    indicatorDots: true,
    indicatorColor: '#e7e0d6',
    indicatorActiveColor: '#fed102',
    scrollTop: 0,
    standard_fade: 0,
    total_num: 0,
    fetch_finish: false,
    standard_now: {
      t_id: '',
      c_id: '',
      g_id: '',
      s_id: '',
      idx: '',
      index: 0
    },
    preview_img_list: []
  },
  choosen: function (e) {
    var that = this;
    if (that.data.total_num) {
      app.go_to_cart();
    }

  },
  onLoad: function (options) {
    console.log(options);
    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    //window为保留字
    app.get_window_info(this);
    that.setData({
      goods_id: options.goods_id, //2159898
      stage_id: options.stageid
    })
    that.fetch();
  },
  fetch: function () {
    var that = this;
    app.util.yue_request({
      url: app.globalData.api_domain + '/goods_details/goods_details.php',
      data: {
        app_session: app.globalData.app_session,
        goods_id: that.data.goods_id,
        stage_id: that.data.stage_id ? that.data.stage_id : ''
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (resr,res) {
        // success
        that.setData({
          info: res.data.result_data.data,
          fetch_finish: true,
          scrollTop: 0
        });
        that.add_num();

        var introduce = that.data.info.content;
        /**
        * WxParse.wxParse(bindName , type, data, target,imagePadding)
        * 1.bindName绑定的数据名(必填)
        * 2.type可以为html或者md(必填)
        * 3.data为传入的具体数据(必填)
        * 4.target为Page对象,一般为this(必填)
        * 5.imagePadding为当图片自适应是左右的单一padding(默认为0,可选)
        */
        WxParse.wxParse('introduce', 'html', introduce, that, 10);


        //预览图片
        if (that.data.info.appraise.list.length > 0) {
          var comment_list_len = that.data.info.appraise.list.length;
          for (var i = 0; i < comment_list_len; i++) {
            if (that.data.info.appraise.list[i]["images"].length > 0) {
              for (var j = 0; j < that.data.info.appraise.list[i]["images"].length; j++) {
                that.data.preview_img_list.push(that.data.info.appraise.list[i]["images"][j]["big"]);
              }
            }
          }
        }
        that.setData({
          preview_img_list: that.data.preview_img_list
        })
        //预览图片     
      },
      fail: function (resr,res) {
        // fail
      },
      complete: function (resr,res) {
        // complete
      }
    })
  },
  set_title: function (str) {
    if (str) {
      wx.setNavigationBarTitle({
        title: that.data.str
      })
    }
  },
  onReady: function () {
    // 页面渲染完成
    console.log('onready');
  },
  onShow: function () {
    var that = this;
    if (that.data.fetch_finish) that.add_num();
    console.log("1233211");
    console.log(app.globalData.cart_data);
    console.log(app.globalData.nav_cache);
    if (app.globalData.nav_cache.goods_details) {
      that.setData({
        goods_id: app.globalData.nav_cache.goods_details, //2159898
        stage_id: app.globalData.nav_cache.goods_details_stage
      })
      app.globalData.nav_cache.goods_details = null;
      app.globalData.nav_cache.goods_details_stage = null;
      that.fetch();
      
    }
  },
  onHide: function () {
    // 页面隐藏
    console.log('onhide');
  },
  onUnload: function () {
    // 页面关闭
    console.log('onunload');
  },
  add_num: function () {
    var that = this;
    // 页面显示 计算商品数量
    var res = app.globalData.cart_data;
    var temp = that.data.info;
    var t = temp.type_id;
    var c = temp.classify_id;
    var g = temp.goods_id;
    var num = 0;
    try {
      num = app.count_num(res[t][c][g]);
      temp.g_num = num;
      var num_2 = 0;
      for (var j in temp.standard) {
        var s = temp.standard[j].standard_id;
        num_2 = res[t][c][g][s];
        if (typeof num_2 == 'number') temp.standard[j].g_num = num_2;
      }
    }
    catch (e) {
      console.log(e);
    }
    that.setData({
      info: temp,
      total_num: app.count_num(res)
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
  choose: function (e) {
    var that = this;
    var temp = that.data.info;
    var goods_id = temp.goods_id
    var classify_id = temp.classify_id;
    var type_id = temp.type_id;
    console.log(1111111)
    console.log(temp)
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
    if (1 >= temp.standard.length) {
      console.log(222222)
      //只有一个商品
      console.log(temp.standard[0])
      if (temp.standard[0].g_num >= temp.standard[0].stock_num || temp.standard[0].stock_num == 0) {
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
      var standard_id = temp.standard[0].standard_id || temp.standard[0].options[0].standard_id;
      var res = app.set_cart({
        control: 'plus',
        type_id: type_id,
        classify_id: classify_id,
        goods_id: goods_id,
        standard_id: standard_id
      })

      console.log(res);
      console.log(app.globalData.cart_data)
      console.log(type_id, classify_id, goods_id, standard_id)
      var pkg = res;
      var pkg_3 = res[type_id][classify_id][goods_id][standard_id];

      console.log(app.count_num(pkg_3))
      temp.standard[0].g_num = pkg_3;
      console.log()
      that.setData({
        info: temp,
        total_num: app.count_num(pkg)
      })
    }
    else {
      console.log(33333333)
      //多个商品
      var itemidx = e.currentTarget.dataset.itemidx;
      var has_g_num = false;
      var obj = that.data.standard_now;
      console.log(temp)
      for (var k in temp.standard) {
        if (temp.standard[k].g_num) {
          obj.index = k;
          //存在
          has_g_num = true;
          break;
        }
      }
      var some_num = false;
      if (!has_g_num) {
        for (var i in temp.standard) {
          if (temp.standard[i].stock_num != 0) {
            obj.index = i;
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
          standard_now: obj
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
    }
    console.log(e);
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
    var goods_id = that.data.info.goods_id;
    var classify_id = that.data.info.classify_id;
    var type_id = that.data.info.type_id;
    var standard_id = that.data.info.standard[0].standard_id || that.data.info.standard[0].options[0].standard_id;
    var temp = that.data.info;
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
    if (types == 'plus' && temp.standard[0].g_num >= temp.standard[0].stock_num || temp.standard[0].stock_num == 0) {
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



    temp.g_num = app.count_num(pkg_3);
    temp.standard[0].g_num = pkg_4;
    that.setData({
      info: temp,
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

    var temp = that.data.info;
    if (types == 'plus' && temp.standard[itemindex].g_num >= temp.standard[itemindex].stock_num) {
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


    temp.g_num = app.count_num(pkg_3);
    temp.standard[itemindex].g_num = pkg_4;

    that.setData({
      info: temp,
      total_num: app.count_num(pkg)
    })
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
  previewImg: function (event) {
    //预览图片
    var self = this;
    var current_img = event.currentTarget.dataset.src;//查看的图片
    var preview_img_list = self.data.preview_img_list;
    wx.previewImage({
      current: current_img, // 当前显示图片的http链接
      urls: preview_img_list // 需要预览的图片http链接列表
    });
  },
  go_to_comment_list: function (event) {
    //跳转到评论列表
    var that = this;
    if (!that.data.navigating) {
      wx.navigateTo({
        url: '/pages/comment_list/comment_list?goods_id=' + that.data.goods_id,
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
  go_to_store: function (e) {
    var that = this;
    var u = e.currentTarget.dataset.user;
    console.log(app.globalData.seat_info.enter);
    console.log(app.globalData.seat_info)
    if (app.globalData.seat_info.enter == 'list') {
      if (!that.data.navigating) {
        wx.navigateTo({
          url: '/pages/store/store?seller_id=' + u,
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
    }
    else {
      wx.navigateBack({
        delta: 1, // 回退前 delta(默认为1) 页面
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
  },
  go_video: function (e) {
    var that = this;
    console.log(e)
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
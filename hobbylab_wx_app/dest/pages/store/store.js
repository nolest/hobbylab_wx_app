// pages/store/store.js
//var WxParse = require('../../utils/wxParse_v2/wxParse.js');
var app = getApp();
Page({
  data: {
    seller_id: "",
    inn_id: "",
    place_id: "",
    seller_info: {},
    goods_list: [],
    page: 1,
    has_next_page: 1,
    goods_list_lock: "0"
  },
  onLoad: function (options) {
    console.log(options);
    app.get_window_info(this);
    // 页面初始化 options为页面跳转所带来的参数
    var self = this;
    self.setData({
      seller_id: options.seller_id,
      inn_id: options.id,
      place_id: app.globalData.seat_info.place_store_id,
    });
    console.log("inn_id为"+self.data.inn_id);

    //设置标题
    wx.setNavigationBarTitle({
      title: '商家主页'
    })
    // app.ready(function () {
    //   self.fetch();
    // }, function () { })
    self.fetch();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //获取数据
  fetch: function () {
    var self = this;
    app.util.yue_request({
      url: app.globalData.api_domain + '/store/store.php',
      data: {
        seller_id: self.data.seller_id,
        inn_id: self.data.inn_id,
        place_id: self.data.place_id,
        //app_session: app.globalData.app_session
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (resr,res) {
        // success
        console.log(res);
        var data = res.data.result_data.data;
        if (data.result > 0) {
          console.log("data.result为"+data.result);
          //设置数据
          self.setData({
            seller_info: data,
          });
          var introduce = data["introduce"];
          /**
          * WxParse.wxParse(bindName , type, data, target,imagePadding)
          * 1.bindName绑定的数据名(必填)
          * 2.type可以为html或者md(必填)
          * 3.data为传入的具体数据(必填)
          * 4.target为Page对象,一般为this(必填)
          * 5.imagePadding为当图片自适应是左右的单一padding(默认为0,可选)
          */
          //WxParse.wxParse('introduce', 'html', introduce, self, 10);

          //如果没有seller_id，设置seller_id
          if (!self.data.seller_id) {
            self.setData({
              seller_id: data["user_id"]
            })
          }
          //获取商品列表
          console.log("获取商品列表");
          self.get_goods_list();
        }
        else {

          wx.showModal({
            title: '提示',
            content: data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      },
      fail: function (resr,res) {
        // fail
      },
      complete: function (resr,res) {
        // complete
      }
    })
  },
  //获取商品列表
  get_goods_list: function () {
    var self = this;
    console.log("触发获取商品列表");
    if (self.data.has_next_page < 1) {
      return;
    }
    if (self.data.goods_list_lock == "1") {
      return
    }

    // if(self.data.page!=1)
    // {
      wx.showToast({
        title: '加载商品列表',
        icon: 'loading',
        duration: 10000,
        mask: true
      });
    //}
    
    //设置锁
    self.setData({
      goods_list_lock: "1"
    });
    var self = this;
    app.util.yue_request({
      url: app.globalData.api_domain + '/store/store_goods_list.php',
      data: {
        seller_id: self.data.seller_id,
        place_id: self.data.place_id,
        page: self.data.page
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (resr,res) {
        // success
        console.log(res);
        var data = res.data.result_data.data;
        if (data.result == 1) 
        {
            console.log("数据长度"+data.list.length);
            if (data.list.length > 0) 
            {
                var data_list_len = data.list.length;
                console.log("长度"+data_list_len);
                for (var i = 0; i < data_list_len; i++) {
                  self.data.goods_list.push(data.list[i])
                }
                //判断是否加大页码
                if (data.has_next_page > 0)
                {
                  self.data.page = self.data.page + 1;
                }
                self.setData({
                  goods_list: self.data.goods_list,
                  page: self.data.page,
                });
            }
            else 
            {
                console.log("no more goods");
            }
            //设置没有更多
            self.setData({
              has_next_page: data.has_next_page
            });
        }
        else 
        {
            wx.showToast({
                title: data.message,
                icon: 'loading',
                duration: 2000,
            });
        }
      },
      fail: function (resr,res) {
        // fail
      },
      complete: function (resr,res) {
        // complete
        wx.hideToast();
        //开锁
        self.setData({
          goods_list_lock: "0"
        });
      }
    })

  },
  //跳转到详情页面
  go_goods_detail: function (event) {
    var goods_id = event.currentTarget.dataset.goodsId;
    var stage_id = event.currentTarget.dataset.stageId;
    console.log(event);
    //判断来源
    console.log(app.globalData.seat_info)
    console.log('goods_id' + goods_id);
    console.log(event);
    var enter = app.globalData.seat_info.enter;
    if (enter == "list") {
      //来源列表
      //设置全局标识值
      app.globalData.nav_cache.goods_details = goods_id;
      app.globalData.nav_cache.goods_details_stage = stage_id;
      //返回
      wx.navigateBack({
        delta: 1
      })
    }
    else {
      //非列表进，直接跳转
      wx.navigateTo({
        url: '/pages/goods_details/goods_details?goods_id=' + goods_id + '&stageid=' + stage_id,
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
  }
})
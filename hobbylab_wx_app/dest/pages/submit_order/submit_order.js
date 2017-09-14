// pages/submit_order/submit_order.js
var app = getApp();
Page({
  data: {
    window: {
      windowHeight: 800
    },
    cart_null: false,
    pay_res: '',
    fetching: false,
    submit_ok: {},
    pay_again: [],
    standard_fade : 0,
    cur_csn_arr : [],
    list_item_index : '',
    now_pre_set_scn : '',
    switches : false
  },
  onLoad: function (options) {
    var that = this;
    app.get_window_info(this);
    console.log(app.globalData.cart_data);
    if (app.count_num(app.globalData.cart_data) == 0) {
      that.setData({
        cart_null: true,
        pay_res: ''
      })
    }
    wx.setNavigationBarTitle({
      title: '提交订单'
    })
    app.ready(function () {
      that.fetch();
    }, function () { })

    that.setData({
      desk: '所在位置：' + app.globalData.seat_info.name
    })
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
  pay: function () {
    console.log('pay');
  },
  fetch: function () {
    var that = this;
    app.util.yue_request({
      url: app.globalData.api_domain + '/submit_order/get_order.php',
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
          //计算内外层优惠券数组
          //var cur_csn_arr = that.combine_csn_arr(res.data.result_data.data.cart_list, res.data.result_data.data.coupon);
          //计算优惠券数据结构
          var sn_obj = that.combine_sn_obj(res.data.result_data.data.cart_list);
          console.log(sn_obj);

          that.setData({
            cart_null: false,
            list: res.data.result_data.data.cart_list,
            total_amount: res.data.result_data.data.pending_amount,
            bill: res.data.result_data.data.bill,
            coupon: res.data.result_data.data.coupon,
            card_info: res.data.result_data.data.card_info,
            coupon_list: res.data.result_data.data.coupon_list,
            is_allow_mcard: res.data.result_data.data.is_allow_mcard,
            is_use_mcard: res.data.result_data.data.is_use_mcard,
            sn_obj: sn_obj
          })
          if (res.data.result_data.data.is_use_mcard == "0"){
            that.switch1Change({ detail: { value: false } })
          }
          else{
            that.switch1Change({ detail: { value: true } })
          }
          
        }

      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })
  },
  pay_again: function () {
    var that = this;
    app.util.yue_request({
      url: app.globalData.api_domain + '/order_list/get_payment.php',
      data: {
        app_session: app.globalData.app_session,
        order_sn: that.data.pay_again.join(",")
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
            'success': function (resr) {
              var status = resr.errMsg;
              that.setData({
                submit_ok: {
                  seat: that.data.payment_obj.data.result_data.order_data.data.location,
                  pay: '微信',
                  price: that.data.payment_obj.data.result_data.order_data.data.total_amount,
                  time: that.data.payment_obj.data.result_data.order_data.data.add_time
                }
              })
              if (status == "requestPayment:ok") {
                that.setData({
                  pay_res: 'success'
                })
                //扫码下单后重置座位信息
                console.log('137:重置')
                app.reset_seat_info();
              }
              //回到订单列表页时刷新
              app.globalData.nav_cache.order_list = 1;
            },
            'fail': function (resr) {
              console.log(123123123312312);
              that.setData({
                pay_res: 'fail'
              })
              //回到订单列表页时刷新
              app.globalData.nav_cache.order_list = 1;
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
  close_choose : function(){
    var that = this;
    that.setData({
      standard_fade : 0
    })
  },
  choosen: function () {
    var that = this;
    // app.globalData.seat_info.action = options.action;
    // app.globalData.seat_info.seat_type = options.seat_type;
    // app.globalData.seat_info.place_store_id = options.place_store_id;
    // app.globalData.seat_info.id = options.id; 
    if (that.data.fetching) return
    wx.showToast({
      title: '提交中',
      icon: 'loading',
      duration: 10000
    })
    that.setData({
      fetching: true
    })
    console.log(app.globalData.cart_data);

    app.util.yue_request({
      url: app.globalData.api_domain + '/submit_order/submit_order.php',
      data: {
        app_session: app.globalData.app_session,
        cart_data: app.globalData.cart_data,
        address: app.globalData.seat_info.name,
        place_id: app.globalData.seat_info.place_store_id,
        seat_type: app.globalData.seat_info.seat_type,
        inn_id: app.globalData.seat_info.id,
        coupon_list: that.data.switches ? [] : that.combine_sn_arr(),
        card_id: that.data.switches ? that.data.card_info.card_id : ''
      },
      header: {
        'content-type': 'application/json'
      },
      // header: {}, // 设置请求的 header
      success: function (resr,res) {
        // success
        console.log(res);
        that.setData({
          payment_obj : res
        })
        if (res.data.result_data.data.result != "20100" && res.data.result_data.data.result != "20000"){
          console.log('下单失败');
          wx.showModal({
            title: '下单异常',
            content: res.data.result_data.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                // that.setData({
                //   pay_res: 'success'
                // })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
        else if (res.data.result_data.data.result == "20100"){
          //打开我的页跳转到
          app.globalData.cart_data = {};
          that.setData({
            pay_res: 'success',
            submit_ok: {
              seat: res.data.result_data.order_data.data.location,
              pay: '微信',
              price: res.data.result_data.order_data.data.pending_amount,
              time: res.data.result_data.order_data.data.add_time
            }
          })
        }
        else if (res.data.result_data.data.result == "20000"){
          //英健处理过的可支付order_sn
          var order_sn = res.data.result_data.data.data.pay_order_list;
          that.setData({
            pay_again: order_sn
          })
          console.log('提交订单成功');
          app.globalData.cart_data = {};
          var payment = JSON.parse(res.data.result_data.data.data.request_data);
          wx.requestPayment({
            'timeStamp': payment.timeStamp,
            'nonceStr': payment.nonceStr,
            'package': payment.package,
            'signType': payment.signType,
            'paySign': payment.paySign,
            'success': function (resr) {
              var status = resr.errMsg;
              that.setData({
                submit_ok: {
                  seat: res.data.result_data.order_data.data.location,
                  pay: '微信',
                  price: res.data.result_data.order_data.data.pending_amount,
                  time: res.data.result_data.order_data.data.add_time
                }
              })
              if (status == "requestPayment:ok") {
                that.setData({
                  pay_res: 'success'
                })
                //扫码下单后重置座位信息
                console.log('276:重置')

                app.reset_seat_info();
              }
              //回到订单列表页时刷新
              app.globalData.nav_cache.order_list = 1;
            },
            'fail': function (resr) {
              that.setData({
                pay_res: 'fail'
              })
              //回到订单列表页时刷新
              app.globalData.nav_cache.order_list = 1;
            }
          })
          console.log(payment);
        }
        else{

        }
        //提交不了的话是位置信息有误
        // if (res.data.result_data.data.result == 20100 ){
        //   //打开我的页跳转到
        //   app.globalData.cart_data = {};
        //   that.setData({
        //     pay_res: 'success',
        //     submit_ok: {
        //       seat: res.data.result_data.order_data.data.location,
        //       pay: '微信',
        //       price: res.data.result_data.order_data.data.total_amount,
        //       time: res.data.result_data.order_data.data.add_time
        //     }
        //   })
        // }
        // else if (res.data.result_data.data.result != 20000) {
        //   console.log('支付失败');
        //   wx.showModal({
        //     title: '支付异常',
        //     content: res.data.result_data.data.message,
        //     showCancel: false,
        //     success: function (res) {
        //       if (res.confirm) {
        //         that.setData({
        //           pay_res: 'success'
        //         })
        //       } else if (res.cancel) {
        //         console.log('用户点击取消')
        //       }
        //     }
        //   })
        // }
        // else {
        //   //英健处理过的可支付order_sn
        //   var order_sn = res.data.result_data.data.data.pay_order_list;
        //   that.setData({
        //     pay_again: order_sn
        //   })
        //   console.log('提交订单成功');
        //   app.globalData.cart_data = {};
        //   var payment = JSON.parse(res.data.result_data.data.data.request_data);
        //   wx.requestPayment({
        //     'timeStamp': payment.timeStamp,
        //     'nonceStr': payment.nonceStr,
        //     'package': payment.package,
        //     'signType': payment.signType,
        //     'paySign': payment.paySign,
        //     'success': function (resr) {
        //       var status = resr.errMsg;
        //       that.setData({
        //         submit_ok: {
        //           seat: res.data.result_data.order_data.data.location,
        //           pay: '微信',
        //           price: res.data.result_data.order_data.data.total_amount,
        //           time: res.data.result_data.order_data.data.add_time
        //         }
        //       })
        //       if (status == "requestPayment:ok") {
        //         that.setData({
        //           pay_res: 'success'
        //         })
        //         //扫码下单后重置座位信息
        //         console.log('276:重置')
                
        //         app.reset_seat_info();
        //       }
        //       //回到订单列表页时刷新
        //       app.globalData.nav_cache.order_list = 1;
        //     },
        //     'fail': function (resr) {
        //       that.setData({
        //         pay_res: 'fail'
        //       })
        //       //回到订单列表页时刷新
        //       app.globalData.nav_cache.order_list = 1;
        //     }
        //   })
        //   console.log(payment);
        // }
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
        wx.hideToast();
        that.setData({
          fetching: false
        })
      }
    })
  },
  go_order: function () {
    var that = this;
    that.pay_finish_to_order();
  },
  go_index: function () {
    wx.switchTab({
      url: '/pages/index/index',
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
  switch1Change : function(e){
    console.log('switch1 发生 change 事件，携带值为', e.detail.value)
    var that = this;
    if (e.detail.value){
      console.log("选会员卡")
      var list = that.data.list;
      for(var i in list){
        list[i].coupon = {}
      }
      that.setData({
        list: list,
        cur_csn_arr : [],
        now_pre_set_scn : '',
        switches: true
      })
      console.log('11111')
      that.order_calculate();
    }
    else{
      console.log("不选会员卡");
      that.setData({
        switches: false
      })
      console.log('222222222')
      var arr = that.sn_obj_to_arr();
      that.order_calculate(arr);
    }
  },
  pre_set_coupon_list : function(e){
    //点击店铺优惠券选择
    var that = this;
    //当前商品选中的优惠券
    var csn = e.currentTarget.dataset.csn;
    //当前商品的index
    var lindex = e.currentTarget.dataset.lindex;

    that.setData({
      standard_fade: 1,
      list_item_index: lindex
    })
  },
  cou_list : function(e){
    //点击优惠券列表选项
    console.log(e)
    var that = this;
    //选中的sn
    var lcsn = e.currentTarget.dataset.lcsn;
    //当前选中
    var nowsn = that.data.now_pre_set_scn;//e.currentTarget.dataset.nowsn;
    //当前选项的index
    var nowindex = e.currentTarget.dataset.nowindex;
    //更新当前选中的coupon对象
    if ( nowindex != 'none'){
      //选中优惠券
      var obj = that.data.sn_obj;
      obj[that.data.list_item_index] = that.data.list[that.data.list_item_index].coupon_list[nowindex];
      that.setData({
        sn_obj: obj,
        standard_fade: 0
      })
    }
    else{
      //不选优惠券
      var obj = that.data.sn_obj;
      obj[that.data.list_item_index] = {};
      that.setData({
        sn_obj: obj,
        standard_fade: 0
      })
    }

    var have_coupon = false;
    for(var x in that.data.sn_obj){
      if(that.data.sn_obj[x].coupon_sn){
        have_coupon = true;
      }
    }

    if (have_coupon){
      that.setData({
        switches: false
      })
    }
    else{
      // that.setData({
      //   switches: true
      // })
    }

    var arr = that.sn_obj_to_arr();
    that.order_calculate(arr);

    // var list = that.data.list;
    // console.log(list[that.data.list_item_index].coupon)
    // list[that.data.list_item_index].coupon = that.data.choose_list[nowindex]
    // that.setData({
    //   list : list
    // })
    // //从cur_csn_arr剔除旧lsn,插入新lsn
    // var temp_arr = that.data.cur_csn_arr;
    // var k = [];
    // for (var i in temp_arr){
    //   if (temp_arr[i] == nowsn){
        
    //   }
    //   else{
    //     k.push(temp_arr[i])
    //   }
    // }
    // //temp_arr.splice( temp_arr.indexOf(nowsn),1)
    // //不使用优惠券
    // if (lcsn != 'no'){
    //   k.push(lcsn)
    // }
    // that.setData({
    //   cur_csn_arr: k,
    //   now_pre_set_scn: lcsn,
    //   standard_fade: 0,
    //   switches: false
    // })
    // //发送请求
    // console.log(that.data.cur_csn_arr)
    // that.order_calculate();
  },
  sn_obj_to_arr : function(){
    var that = this;
    //组装提交数组
    var obj = that.data.sn_obj;
    var k = [];
    for(var i in obj){
      if (obj[i].coupon_sn){
        k.push(obj[i].coupon_sn)
      }
    }
    return k
  },
  combine_sn_obj : function(list){
    var that = this;
    var obj = {};
    for(var i in list){
      console.log(typeof list[i].coupon);
      obj[i] = list[i].coupon
    }
    return obj
  },
  combine_sn_arr : function(sn_obj){
    var that = this;
    var t = that.data.sn_obj;
    var k = [];
    for (var i in t){
      if (t[i].coupon_sn){
        k.push(t[i].coupon_sn)
      }
    }
    console.log(k);
    return k
  },
  combine_csn_arr : function(list,outer_coupon){
    var that = this;
    console.log(list);
    var temp_arr = [];
    for(var i in list){
      if(list[i].coupon.length != 0){
        temp_arr.push(list[i].coupon.coupon_sn)
      }
    }
    // 隐藏平台优惠券
    // if(outer_coupon.length != 0){
    //   temp_arr.push(outer_coupon.coupon_sn)
    // }
    return temp_arr
  },
  order_calculate : function(coupon_list){
    var that = this;
    console.log(coupon_list);
    if (that.data.fetching) return
    wx.showToast({
      title: '提交中',
      icon: 'loading',
      duration: 10000
    })
    app.util.yue_request({
      url: app.globalData.api_domain + '/submit_order/order_calculate.php',
      data: {
        app_session: app.globalData.app_session,
        cart_data: app.globalData.cart_data,
        coupon_list: coupon_list || [],
        card_id: that.data.switches?that.data.card_info.card_id:''
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (resr, res) {
        // success
        //设置初始化值
        console.log(res);
        //修改物品list
        var cart_list_temp = that.data.list;
        var new_cart_list = res.data.result_data.data.cart_list;
        for (var i in new_cart_list){
          cart_list_temp[i].coupon = new_cart_list[i].coupon;
          cart_list_temp[i].pending_amount =  new_cart_list[i].pending_amount;
        }
        //修改总价和优惠金额
        that.setData({
          bill: res.data.result_data.data.bill,
          total_amount :res.data.result_data.data.pending_amount,
          list: cart_list_temp
        })
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
  pay_finish_to_order : function(){
    app.globalData.mine_to_list = true;
    wx.switchTab({
      url: '/pages/mine/mine',
    })
  }
})
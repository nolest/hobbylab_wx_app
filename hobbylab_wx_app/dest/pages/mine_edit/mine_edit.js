// pages/mine_edit/mine_edit.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fetch_lock: false,
    submit_lock: false,
    mine_info: {}
  },
  //获取数据
  fetch: function () {
    var self = this;
    //检测是否获取数据被锁
    if (self.data.fetch_lock) {
      return;
    }
    //设置Loading
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    });

    self.data.fetch_lock = true;

    app.util.yue_request({
      url: app.globalData.api_domain + '/mine/get_mine.php',
      data: {
        app_session: app.globalData.app_session
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res, resr) {
        // success
        wx.hideToast();
        console.log(resr);
        var res_data = resr.data.result_data;
        if (res_data.data.result == "1") {
          self.setData({
            mine_info: res_data.data,
          });
        }
        else {
          wx.hideToast();
          wx.showToast({
            title: "加载数据出错",
            icon: 'loading',
            duration: 1500
          });
        }  
      },
      fail: function (res) {
        // fail
        wx.hideToast();
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
  //更改头像
  change_avatar:function(){
    var self = this;
    console.log("触发选择图片");
    var hash = self.data.mine_info.hash;
    var user_id = self.data.mine_info.user_id;
    if(!hash || !user_id)
    {
      wx.showToast({
        title: '缺少hash或者user_id',
        icon: 'loading',
        duration: 1500
      });
      return;
    }
    //选图
    wx.chooseImage({
      count: 1, //根据变量控制最大传送值
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths);
        console.log(hash);

        if (tempFilePaths.lenght == 0)
        {
          return;
        }

        //延迟处理，避免在手机端跟“处理中”的loading冲突
        setTimeout(function(){
          wx.hideLoading()
          wx.hideToast();
          wx.showLoading({
            title: '头像上传中...',
            duration: 900000
          });
          //传图操作
          //传图方法
          var tempFilePaths_item = tempFilePaths[0];
          console.log(tempFilePaths_item);
          console.log(hash);
          wx.uploadFile({
            url: 'https://sendmedia-w.yueus.com/icon.cgi', //仅为示例，非真实的接口地址
            filePath: tempFilePaths_item,
            name: 'opus',
            formData: {
              'hash': hash,
              'role': "",
              'poco_id': user_id,
            },
            success: function (res) {
              var data = res.data
              data = JSON.parse(data);
              //do something
              console.log(data)
              if (data.code == 0) {
                var img_url = data.url;
                console.log("传图成功");
                console.log(img_url);

                //设置图片后置参数，刷到最新
                if (img_url.indexOf('?') != -1) {
                  img_url = img_url + '&' + new Date().getTime();
                }
                else {
                  img_url = img_url + '?' + new Date().getTime();
                }

                wx.hideLoading()
                self.setData({
                  'mine_info.avatar': img_url
                }, function () {
                  //设置完数据隐藏
                  
                  wx.showToast({
                    title: '头像修改成功',
                    icon: "success",
                    duration: 1500
                  });
                })
              }
              else {
                wx.hideLoading()
                wx.hideToast();
                //其他错误
                wx.showToast({
                  title: data.message,
                  icon: "loading",
                  duration: 2000
                });
              }
            },
            fail: function () {
              wx.hideLoading()
              wx.hideToast();
              wx.showToast({
                title: '网络错误，请重新再试',
                icon: "loading",
                duration: 2000
              });
            },
            complete: function () {

            }
          });
        },500);
      },
      complete:function(){
        //传图提示
        
        
      }
    })
  },
  //名字输入
  name_input:function(event){
    var self = this;
    console.log(event.detail.value);
    self.data.mine_info.name = event.detail.value;//存入数据
  },
  //内容提交
  submit_data:function(){
    var self = this;
    //检查锁
    if(self.data.submit_lock)
    {
      return;
    }
    //检查相应的值是否存在
    var name_check = self.check_exit(self.data.mine_info.name);
    if (!name_check)
    {
      wx.showToast({
        title: '请填入名字',
        icon: 'loading',
        duration: 1500
      });
      return;
    }
    //设置Loading
    wx.showToast({
      title: '保存中...',
      icon: 'loading',
      duration: 10000
    });
    self.data.submit_lock = true;

    app.util.yue_request({
      url: app.globalData.api_domain + '/mine/edit_mine.php',
      data: {
        app_session: app.globalData.app_session,
        name: self.data.mine_info.name
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res, resr) {
        wx.hideToast();
        // success
        console.log("保存成功");
        console.log(resr);
        var res_data = resr.data.result_data;
        console.log(res_data);
        if (res_data.data.result=="1")
        {
          //提交成功后续操作
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 1500,
          }); 
          setTimeout(function(){
            wx.navigateBack({
              delta: 1
            });
          },1500);
        }
        else
        {
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
      title: '修改资料'
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
    });
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
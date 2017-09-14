// pages/comment/comment.js
var app = getApp();
Page({
  data:{
    comment_list :[],//显示数据的数组
    submit_list : [],//提交数据的数组
    anonymous_choose_img : '../../image/comment/name-choose-36x36.png',//匿名图
    anonymous_no_choose_img : '../../image/comment/name-no-choose-36x36.png',
    star_config : ["非常差","差","一般","好","非常好"],
    level_config : '5',//初始化评论等级为好
    level_name_config :'非常好',
    is_anonymous_config:'0',
    submit_comment_lock:"0",
    get_comment_lock:"0",
    order_sn_config:"",
    user_id_config:""
  },
  onLoad:function(options){
    var self = this;
    app.get_window_info(this);
    //获取登录状态
    app.ready(function(res){
      //成功获取登录状态
      console.log(res);//res,全局属性
      //that.fetch();
    },
    function(){
      //失败处理
    });
    // 页面初始化 options为页面跳转所带来的参数
    self.setData({
      order_sn_config : options.order_sn,
    });
    self.fetch();
    //设置标题
    wx.setNavigationBarTitle({
          title: '提交评价'
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  fetch:function(){
    //初始化评价
    console.log("触发了获取方法");
    //获取数据列表
    var self = this;

    //判断是否锁住
    if(self.data.get_comment_lock=="1")
    {
      wx.showToast({
        title: '正在加载数据...',
        icon: 'loading',
        duration: 2000
      })
      return
    }
    wx.showToast({
      title: '正在加载数据...',
      icon: 'loading',
      duration: 10000,
      mask:true
    })

    //锁住
    self.setData({
      get_comment_lock:"1"
    })

    app.util.yue_request({
      url: app.globalData.api_domain + '/comment/comment.php',
      data: {
        order_sn : self.data.order_sn_config,
        app_session : app.globalData.app_session
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(resr,res){
        
        // success
        console.log(res);
        var data = res.data.result_data.data;
        if(data.goods && data.goods.length>0)
        {
          var goods_list_length = data.goods.length;
          for(var i=0;i<goods_list_length;i++)
          {
            //初始化展示的数组
            self.data.comment_list[i] = data.goods[i];
            self.data.comment_list[i]["btn_show"] = 'ds-flex';//传图按钮
            self.data.comment_list[i]["level"] = self.data.level_config;//初始化的评价
            self.data.comment_list[i]["level_name"] = self.data.level_name_config;//初始化的评价名字
            self.data.comment_list[i]["img_list"] = [];//评价图的数组
            self.data.comment_list[i]["is_anonymous"] = self.data.is_anonymous_config;//是否匿名
            //初始化提交的数组
            self.data.submit_list[i] = {};
            self.data.submit_list[i]["goods_id"] = data.goods[i]["goods_id"];
            self.data.submit_list[i]["level"] = self.data.level_config;//初始化的评价
            self.data.submit_list[i]["img_list"] = [],
            self.data.submit_list[i]["is_anonymous"] = self.data.is_anonymous_config;
            self.data.submit_list[i]["content"] = '';//内容
          }
          //设置数据
          self.setData({
            comment_list:self.data.comment_list,
            submit_list:self.data.submit_list,
            user_id_config:data.user_id
          })
        }
        else
        {
          wx.showModal({
            title: '提示',
            content: data.message,
            showCancel : false,
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
          // setTimeout(function(){
          //   wx.showToast({
          //     title: data.message,
          //     icon:"loading",
          //     duration: 20000,
          //   })
          // },500)
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
          get_comment_lock:"0"
        })

      }
    })
  },
  //切换星星等级
  starTap:function(event){
    var self = this;
    var seq = event.currentTarget.dataset.seq;
    var index = event.currentTarget.dataset.index;
    //设置等级名字
    var level_name = self.data.star_config[seq];
    console.log("触发修改等级");
    //设置对象
    var set_params = {};
    var path_1 = 'comment_list['+index+'].level';
    var path_2 = 'comment_list['+index+'].level_name';
    var path_3 = 'submit_list['+index+'].level';
    set_params[path_1] = parseInt(seq)+1;
    set_params[path_2] = level_name;
    set_params[path_3] = parseInt(seq)+1;
    //设置数据
    self.setData(set_params);
  },
  //输入内容
  textAreaChange:function(event){
    var self = this;
    var index = event.currentTarget.dataset.index;
    var cur_value = event.detail.value;
    console.log("触发修改内容");
    console.log(index);
    console.log(cur_value); 
    //设置对象
    var set_params = {};
    var path_1 = 'submit_list['+index+'].content';
    set_params[path_1] = cur_value;
    self.setData(set_params);
  },
  //删图处理
  imgCancel:function(event){
      var self = this;
      var index = event.currentTarget.dataset.index;
      var child_index = event.currentTarget.dataset.childIndex;
      console.log("触发删除图片");
      console.log(index);
      console.log(child_index);
      self.data.comment_list[index]["img_list"].splice(child_index,1);

      //设置对象
      var set_params = {};
      var path_1 = 'comment_list['+index+'].btn_show';
      var path_2 = 'comment_list['+index+'].img_list';
      var path_3 = 'submit_list['+index+'].img_list';
      set_params[path_1] = "ds-flex";
      set_params[path_2] = self.data.comment_list[index]["img_list"];
      set_params[path_3] = set_params[path_2];
      self.setData(set_params);

  },
  //传图处理
  imgAdd:function(event){
      var self = this;
      var index = event.currentTarget.dataset.index;
      var max_count = 9;//上传图张数控制
      console.log("触发选择图片");
      //根据当前图片数量控制传图
      var img_list_len = self.data.comment_list[index]["img_list"].length;
      var upload_max_count = max_count-img_list_len;
      console.log(upload_max_count);
      var user_id_config = self.data.user_id_config;
      //选图
      wx.chooseImage({
          count: upload_max_count, //根据变量控制最大传送值
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths
                var tempFilePaths_len = tempFilePaths.length;
                console.log(tempFilePaths_len);
                console.log(img_list_len);
                if((tempFilePaths_len+img_list_len)>=max_count)
                {
                  console.log("图片满了");
                }
                tempFilePaths.reverse();//反序
                console.log(tempFilePaths);

                wx.showToast({
                  title: '上传中,最多'+max_count+'张',
                  icon: 'loading',
                  duration: 1000000,
                  mask:true
                })
                
                //循环传递方法
                var syncUpload = function(tempFilePaths){
                var tempFilePaths_item = tempFilePaths.pop();
                  wx.uploadFile({
                    url: 'https://sendmedia-w.yueus.com/upload.cgi', //仅为示例，非真实的接口地址
                    filePath: tempFilePaths_item,
                    name: 'opus',
                    formData:{
                      'poco_id': user_id_config,
                      'sh_type' : 'merchandise',
                    },
                    success: function(res){
                      var data = res.data
                      data = JSON.parse(data);
                      //do something
                      console.log(data)
                      if(data.code==0)
                      {
                        var img_url = data.url[0];
                        console.log(img_url);
                        //添加图片
                        var push_img = img_url;
                        self.data.comment_list[index]["img_list"].push(push_img);
                        //设置对象
                        var set_params = {};
                        var path_1 = 'comment_list['+index+'].img_list';
                        var path_2 = 'submit_list['+index+'].img_list';
                        set_params[path_1] = self.data.comment_list[index]["img_list"];
                        set_params[path_2] = set_params[path_1];
                        self.setData(set_params);
                        if(tempFilePaths.length > 0){
                          syncUpload(tempFilePaths);
                        }
                        else
                        {
                            wx.hideToast();
                            if((tempFilePaths_len+img_list_len)>=max_count)
                            {
                                //隐藏传图按钮
                                //设置对象
                                var set_params = {};
                                var path_1 = 'comment_list['+index+'].btn_show';
                                set_params[path_1] = 'fn-hide';
                                self.setData(set_params);  
                            }
                        }
                      }
                      else
                      {
                        //其他错误
                        wx.showToast({
                          title: data.message,
                          icon:"loading",
                          duration: 2000
                        });
                      }
                    },
                    fail: function(){
                      wx.showToast({
                          title: '网络错误，请重新再试',
                          icon:"loading",
                          duration: 2000
                        });
                    },
                    complete: function(){
                      
                    }

                  });
                }; 
                //进行上传
                syncUpload(tempFilePaths);
          }
      })
  },
  //匿名处理
  anonymousChange:function(event){
    var self = this;
    var index = event.currentTarget.dataset.index;
    var cur_value = event.currentTarget.dataset.anonymousValue;
    console.log("触发修改匿名");
    console.log(cur_value);

    var is_anonymous = cur_value=='1'?"0":"1";
    //设置对象
    var set_params = {};
    var path_1 = 'comment_list['+index+'].is_anonymous';
    var path_2 = 'submit_list['+index+'].is_anonymous';
    set_params[path_1] = is_anonymous;
    set_params[path_2] = is_anonymous;
    self.setData(set_params);
  },
  //提交评论内容
  submitInfo:function(event){
    console.log("提交评论");
    var self = this;
    if(self.data.submit_comment_lock=="1")
    {
      wx.showToast({
        title: '正在提交中...',
        icon: 'loading',
        duration: 2000
      })
      return;
    }

    wx.showToast({
      title: '提交中',
      icon: 'loading',
      duration: 10000,
      mask:true
    })

    //设置锁
    self.setData({
      submit_comment_lock:"1"
    })

    console.log(self.data.submit_list);
    var submit_list_len = self.data.submit_list.length;
    var submit_array = [];
    for(var i=0;i<submit_list_len;i++)
    {
      submit_array[i] = JSON.stringify(self.data.submit_list[i]);
    }
    submit_array = submit_array.join("|&|");

    wx.request({
      url: app.globalData.api_domain + '/comment/submit_comment.php', //仅为示例，并非真实的接口地址
      method:"POST",
      data: {
        submit_array : submit_array,
        order_sn : self.data.order_sn_config,
        app_session : app.globalData.app_session
      },
      header: {
          'content-type':'application/x-www-form-urlencoded'
      },
      success: function(res) {
        console.log(res);
        var data = res.data.result_data.data;
        if(data.result==1)
        {
            setTimeout(function(){
              wx.showToast({
                title: '评价成功',
                icon: 'success',
                duration: 1000,
                complete:function(){
                  console.log("评价成功");
                  //返回设置
                  app.globalData.nav_cache.order_list = 1;
                }
              })
            },500)

            setTimeout(function(){
              //发布完评论后处理
              wx.navigateBack({
                delta: 1
              })
            },1500)
            

        }
        else
        {
          setTimeout(function(){
            wx.showToast({
              title: data.message,
              icon: 'loading',
              duration: 2000,
              complete:function(){
                  console.log(data.message)
                }
            })
          },500)
        }
      },
      fail: function (resr,res){

      },
      complete: function (resr,res){
        wx.hideToast();
        //开锁
        self.setData({
          submit_comment_lock:"0"
        })
      }
    })
  }
})
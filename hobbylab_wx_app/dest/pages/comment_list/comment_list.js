// pages/comment_list/comment_list.js
var app = getApp();
Page({
  data:{
    goods_id : '',//后期使用传入值
    page : 1,
    has_next_page : 1,
    comment_list : [],
    comment_list_lock : "0",
    no_data_class : "fn-hide",//无数据提示层
    preview_img_list:[]//预览的图片数组
  },
  onLoad:function(options){
    app.get_window_info(this);
    // 页面初始化 options为页面跳转所带来的参数
    var self = this;
    self.setData({
      goods_id : options.goods_id
    });
    self.fetch();
    //设置标题
    wx.setNavigationBarTitle({
          title: '评价'
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
  previewImg:function(event){
    var self = this;
    console.log(event);
    var current_img = event.currentTarget.dataset.src;//查看的图片
    var preview_img_list = self.data.preview_img_list;//页面的预览图片数组
    wx.previewImage({
      current: current_img, // 当前显示图片的http链接
      urls: preview_img_list // 需要预览的图片http链接列表
    });

  },
  fetch : function(){
    console.log("触发了方法");
    //获取数据列表
    var self = this;
    if(self.data.has_next_page<1)
    {
      return;
    }
    if(self.data.comment_list_lock=="1")
    {
      return
    }
    if(self.data.page!=1)
    {
      wx.showToast({
        title: '正在努力加载',
        icon: 'loading',
        duration: 10000,
        mask:true
      });
    }
    
    //设置锁
    self.setData({
      comment_list_lock:"1"
    });
    app.util.yue_request({
      url: app.globalData.api_domain + '/comment_list/comment_list.php',
      data: {
        goods_id : self.data.goods_id,
        page : self.data.page,
        app_session : app.globalData.app_session
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (resr,res){
        // success
        console.log(res);
        var data = res.data.result_data.data;
        if(data.result == 1)
        {
            
            if(data.list.length>0)
            {
                console.log("数据长度"+data.list.length);
                //循环保存预览图
                var data_list_len = data.list.length;
                for(var i=0;i<data_list_len;i++)
                {
                  if(data.list[i]["images"].length>0)
                  {
                    for(var j=0;j<data.list[i]["images"].length;j++)
                    {
                      self.data.preview_img_list.push(data.list[i]["images"][j]["big"]);  
                    } 
                  }  
                }

                //设置数据
                self.data.comment_list = self.data.comment_list.concat(data.list);
                //判断是否加大页码
                if(data.has_next_page>0)
                {
                  self.data.page = self.data.page+1;
                }
                self.setData({
                  comment_list: self.data.comment_list,
                  page:self.data.page
                });
            }
            else
            {
                console.log("no more comment");
                //设置没有更多
                self.setData({
                  no_data_class:"ds-block"
                });
            }
            self.setData({
              has_next_page:data.has_next_page
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
          comment_list_lock:"0"
        });
      }
    })
  },
})
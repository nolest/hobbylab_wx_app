function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function __handlebars_change_img_resize(img_url, size) {
  var size_str = '';
  size = size + '' || '';
  if (size.indexOf(['120', '320', '165', '640', '600', '145', '440', '230', '260']) != -1) {
    size_str = '_' + size;
  }
  else {
    size_str = '';
  }
  // 解析img_url
  var url_reg = /^http:\/\/(img|image)\d*(-c|-wap|-d)?(.poco.cn.*|.yueus.com.*)\.jpg|gif|png|bmp/i;
  var reg = /_(32|64|86|100|145|165|260|320|440|468|640).(jpg|png|jpeg|gif|bmp)/i;
  if (url_reg.test(img_url)) {
    if (reg.test(img_url)) {
      img_url = img_url.replace(reg, size_str + '.$2');
    }
    else {
      img_url = img_url.replace('/(\.\d*).jpg|.jpg|.gif|.png|.bmp/i', size_str + ".jpg");//两个.jpg为兼容软件的上传图片名
    }
  }
  return img_url;
}

/**
 * 查找指定值是否在数组里面
 */
function in_array(needle, haystack) {
  var length = haystack.length;
  var index = -1;
  for (var i = 0; i < length; i++) {
    if (haystack[i] == needle) {
      return i;
    }
  }
  return index;
}


/**
 * 切换图片size v2
 * @param img_url
 * @param size
 * @param string $size 此处只适用于新版图
                    s32	方形缩略图,边长为32
                    s64	方形缩略图,边长为64
                    s86	方形缩略图,边长为86
                    s100	方形缩略图,边长为100
                    s145	方形缩略图,边长为145
                    s145-hd	方形缩略图,边长为145,增加锐化效果
                    s165	方形缩略图,边长为165
                    s260	方形缩略图,边长为260
                    s260-hd	方形缩略图,边长为260,增加锐化效果
                    s468	方形缩略图,边长为468
                    s640	方形缩略图,边长为640
                    m165	等比例最小边缩略图,最小边为165
                    m320	等比例最小边缩略图,最小边为320
                    m440	等比例最小边缩略图,最小边为440
                    m440-hd	等比例最小边缩略图,最小边为440,增加锐化效果
                    m640	等比例最小边缩略图,最小边为640
                    m640-hd	等比例最小边缩略图,最小边为640,增加锐化效果
                    l165	等比例最大边缩略图,最大边为165
                    l320	等比例最大边缩略图,最大边为320
                    l440	等比例最大边缩略图,最大边为440
                    l440-hd	等比例最大边缩略图,最大边为440,增加锐化效果
                    l640	等比例最大边缩略图,最大边为640
                    l640-hd	等比例最大边缩略图,最大边为640,增加锐化效果
 *
 * @returns {*}
 */
function matching_img_size(img_url, size, size_v2) {
  var size_str = '';

  size = size || '';
  size_v2 = size_v2 || '';

  // 解析img_url

  var url_reg = /^http:\/\/(img|image)\d*(-c|-wap|-d)?(.poco.cn.*|.yueus.com.*)\.jpg|gif|png|bmp/i;

  var new_url_reg = /^http:\/\/(img|image)\d*(-img-ac|-img)?(.poco.cn.*|.yueus.com.*)\.(jpg|gif|png|bmp)/i;

  var reg = /_(32|64|86|100|145|165|260|320|440|468|640).(jpg|png|jpeg|gif|bmp)/i;

  console.log(new_url_reg.test(img_url))
  // 新版传图
  if (new_url_reg.test(img_url)) {
    if (in_array(size_v2, ['s32', 's64', 's86', 's100', 's145', 's145-hd', 's165', 's260', 's260-hd', 's468', 's640', 'm165', 'm320', 'm440', 'm440-hd', 'm640', 'm640-hd', 'l165', 'l320', 'l440', 'l440-hd', 'l640', 'l640-hd']) != -1) {
      size_str = '_' + size_v2;
    }
    else {
      size_str = '';
    }

    var reg = /(jpg|png|jpeg|gif|bmp)_(s32|s64|s86|s100|s145|s145-hd|s165|s260|s260-hd|s468|s640|m165|m320|m440|m440-hd|m640|m640-hd|l165|l320|l440|l440-hd|l640|l640-hd)/i;


    if (reg.test(img_url)) {
      img_url = img_url.replace(reg, "$1" + size_str);
    }
    else {
      img_url = img_url.replace(/(.jpg|.jpg|.gif|.png|.bmp)/i, "$1" + size_str);//两个.jpg为兼容软件的上传图片名
    }
  }
  // 旧版传图
  else if (url_reg.test(img_url)) {
    size = parseInt(size, 10);

    if (in_array(size, [120, 320, 165, 640, 600, 145, 440, 230, 260]) != -1) {
      size_str = '_' + size;
    }
    else {
      size_str = '';
    }

    if (reg.test(img_url)) {
      img_url = img_url.replace(reg, size_str + '.$2');

    }
    else {
      img_url = img_url.replace('/(\.\d*).jpg|.jpg|.gif|.png|.bmp/i', size_str + ".jpg");//两个.jpg为兼容软件的上传图片名

    }
  }

  return img_url;
}

/**
 * 二次封装请求函数，参数与wx.request一样
 */
function yue_request(options) {

  options = options || {};
  console.log('wx.request');
  console.log(options);
  var default_params = {
    url: options.url,
    data: options.data || {},
    header: options.header || { 'Content-Type': 'json' },
    success: function (response) {
      typeof options.success == 'function' && options.success.call(this, response.data, response)
    },
    fail: function (response) {
      typeof options.fail == 'function' && options.fail.call(this, response.data, response)
    },
    complete: function (response) {
      typeof options.complete == 'function' && options.complete.call(this, response.data, response)
    }
  };

  if (options.promise) {
    return new Promise((resolve, reject) => {
      default_params.success = resolve;
      default_params.fail = reject;
      wx.request(default_params);
    })
  }
  else {
    wx.request(default_params)
  }

}

function toast(options) {
  options = options || {};

  if (options.icon == 'warn') {
    options.image = '/image/ui/icon-info-55x55.png'
  }

  wx.showToast(options);
}

function parse_path(path) {
  console.log('123');
  console.log(path)
  var url = path.substring(path.indexOf('?'), path.length); //获取url中"?"符后的字串 
  var theRequest = new Object();
  if (url.indexOf("?") != -1) {
    var str = url.substr(1);
    var strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
  }
  return theRequest;
}

module.exports = {
  formatTime: formatTime,
  change_img_size: __handlebars_change_img_resize,
  yue_request: yue_request,
  change_img_size_v2: matching_img_size,
  toast: toast,
  parse_path: parse_path
}

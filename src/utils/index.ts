import { Base64 } from "./base64";

// 图片url格式转为blob格式
function dataURLtoBlob(dataurl, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('get', dataurl, true);
    xhr.responseType = 'blob';
    xhr.onload = function (res) {
      if (this.status == 200) {
        var blob = this.response;
        callback(blob);
      }
    };
    xhr.send();
  }

export const imgUrlToFile = (img) => {
  return new Promise((resolve) => {
    let fileName = img.split('/').pop();
    let type = fileName.split('.').pop();
    dataURLtoBlob(img, function (blobData) {
      var file = new File([blobData], fileName, { type: 'image/' + type });
      resolve(file);
    });
  })
}

export const getUrlFormData = (res, BigImageUrl, file) => {
  //console.log('queryStsUploadTmpFile',res)
  const POLICYTEXT = {
    expiration: '2023-03-01T12:00:00.000Z', //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
    conditions: [
      ['content-length-range', 0, 1048576000], // 设置上传文件的大小限制
    ],
  };

  const accessid = res.data.stsUploadTmpFile.stsAccessKeyId;
  const accesskey = res.data.stsUploadTmpFile.stsAccessKeySecret;
  const stsSecurityToken = res.data.stsUploadTmpFile.stsSecurityToken;
  const filePath = res.data.stsUploadTmpFile.filePath + '/';
  const bucket = res.data.stsUploadTmpFile.bucket
  const endpoint = res.data.stsUploadTmpFile.endpoint
  //const host = res.data.stsUploadTmpFile.url;
 // const host = `https://de-imagesearch-transfer-station.oss-eu-central-1.aliyuncs.com`
  const host = `https://${bucket}.${endpoint}` //`https://hangzhou-imagesearch-transfer-station.oss-cn-hangzhou.aliyuncs.com`

  const tempImgurl = BigImageUrl;
  
  const encodedPolicy = res.data.stsUploadTmpFile.encodedPolicy
  const picUrl = res.data.stsUploadTmpFile.picUrl
  const objectKey = res.data.stsUploadTmpFile.objectKey
  const policyBase64 = Base64.encode(JSON.stringify(POLICYTEXT));
  const signature = res.data.stsUploadTmpFile.signature; // Crypto.util.bytesToBase64(bytes);
  const filename = tempImgurl.split('/').slice(-1).join() + '.png';
  const multipart_params = {
    key: objectKey,//`${filePath}${filename}`,
    policy: encodedPolicy, //policyBase64,
    OSSAccessKeyId: accessid,
    //stsSecurityToken: accesskey,
    //'x-oss-security-token': '',
    success_action_status: '200', //让服务端返回200,不然，默认会返回204
    signature: signature,
    url: picUrl,
    file: null
  };
  multipart_params.file = file;
  const formData = new FormData();
  for (const name in multipart_params) {
    formData.append(name, multipart_params[name]);
  }
  return { host, formData, filePath, filename, ossUrl: picUrl };
}
  
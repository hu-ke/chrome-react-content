import * as React from "react";
import { FetchGraphql, getIframeUrl } from "./utils/http";
import { getUrlFormData, imgUrlToFile } from "./utils/index";

const Hello = () => {
    const url = 'http://localhost:5173'
    const [iframeVisible, setIframeVisible] = React.useState(false)

    const fetchImgNewUrl = async(url, flag) => {
        const res = await FetchGraphql(`
          query uploadImg4GoogleWishList {
            uploadImg4GoogleWishList(url: "${url}"){
              status
              url
              newUrl
            }
          }
        `, null)
        return {
          newUrl: `https://${res?.data?.uploadImg4GoogleWishList?.newUrl}`,
          status: res?.data?.uploadImg4GoogleWishList?.status,
        //   tabId: tabId,
        }
    }

    const fetchUploadTokens = async() => {
        const res = await FetchGraphql(`
            query fetchImgSearchAuthToken {
                stsUploadTmpFile:fetchImgSearchAuthToken {
                stsAccessKeyId
                stsAccessKeySecret
                bucket
                encodedPolicy
                endpoint
                objectKey
                signature
                useAccelerate
                regionId
                picUrl
                }
            }
        `, 
        null)
        return res
    }

    const FetchPostForm = async (url, formData) => {
        try {
          let response = await fetch(url, {
            method: 'post',
            mode: 'no-cors',
            body: formData,
          })
          return {
            status: response.status,
            data: null,
            ok: response.ok,
          }
        } catch (e) {
        //   message({ message: e.message })
          console.error(e.message)
        }
    }

    const initIframeListener = () => {
        window.addEventListener('message', (e) => {
            const {data} = e
            if(data.isSearchOverCloseClicked) {
                setIframeVisible(false)
            }
        })
    }

    React.useEffect(() => {
        initIframeListener()
        /**
         * Fired when a message is sent from either an extension process or a content script.
         */
        chrome?.runtime?.onMessage?.addListener(messagesFromBackgroundOrPopup);
    }, [])
    const messagesFromBackgroundOrPopup = async(msg, sender, sendResponse) => {
        if (msg.type === 'scanClick') {
            let srcUrl = msg?.srcUrl ?? '';
            // 1.先拿到非跨域图片url
            const msgToSend = await fetchImgNewUrl(srcUrl, true);
            setIframeVisible(true)
            console.log('msgToSend', msgToSend)
            if (msgToSend.status) {
                 // 2.图片url转为file
                const file = await imgUrlToFile(msgToSend.newUrl)

                console.log('2.图片url转为file', file)
                const res = await fetchUploadTokens()

                console.log('3.获取oss上传所需要的token配置', res)
                const {host, formData, filePath, filename, ossUrl} = getUrlFormData(res, srcUrl, file)
                //4.然后上传到oss, 获得新的oss url地址
                await FetchPostForm(host, formData)
                console.log('4.然后上传到oss, 获得新的oss url地址')
                const image = new Image();
                image.src = srcUrl;
                console.log('src>>', srcUrl)
                image.setAttribute("crossOrigin",'Anonymous')
                image.onload = async () => {
                    let res = await getIframeUrl() || ''
                    console.log('res')
                    // @ts-ignore
                    document.getElementById('iframe-searchOver').contentWindow.postMessage({type: 'searchOver', data: {
                        ...msgToSend,
                        ossUrl,
                        isUSA: res && res.indexOf('us-www') > 0,
                        image: {
                            height: image.height,
                            width: image.width,
                            src: srcUrl
                        }
                    }}, '*');
                };
            }
            return
        }
        
        console.log('[content.js]. Message received', msg);
    
        const response = {
            title: document.title,
            headlines: Array.from(document.getElementsByTagName<"h1">("h1")).map(h1 => h1.innerText)
        };
    
        console.log('[content.js]. Message response', response);
    
        sendResponse(response)
    }
    return (
        <>
            {
                iframeVisible ? (
                    <iframe 
                        id="iframe-searchOver"
                        height="100%" 
                        width="100%" 
                        style={{position: 'fixed', left: 0, zIndex: 2147483645, top: 0}}
                        src={`${url}/plugin/search`}
                        title="search"
                        >
                    </iframe>
            ) : ''}
        </>
    )
}

export default Hello;
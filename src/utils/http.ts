
const ENV = 'pre'
const ENVMAP =  {
  'test' : 'https://guang-test.starblink.co/graphql',
  'pre' : 'https://pre-guang.starblink.co/graphql',
  'prod' : 'https://guang.starblink.co/graphql',
  'eu' : 'https://guang.starblink.co/graphql',
  // 'eu' : 'https://eu-guang.starblink.co/graphql',  新欧洲
  'us' : 'https://us-guang.starblink.co/graphql',
  'dev' : 'https://guang-dev.starblink.co/graphql',
}

export const getIframeUrl = async () => {
  const {countryHttpENV} = await chrome.storage.sync.get('countryHttpENV')
  const map={
    'test' : `https://test-getguang-com.starblink.co`,
    'pre' : `https://pre-www.getguang.com`,
    'prod' : `https://getguang.com`,
    'eu' : `https://getguang.com`,
    // 'eu' : `https://eu-www.getguang.com`, 新欧洲
    'us' : `https://us-www.getguang.com`,
    'dev' : `https://dev-getguang-com.starblink.co`,
  }
  // if(ENV !== 'prod'){
    return map[ENV]
  // }
  // return map[countryHttpENV ? countryHttpENV : ENV]
}

export const FetchGraphql = async (query, comp) => {
    const { countryHttpENV } = await chrome.storage.sync.get('countryHttpENV')
    // const httpUrl = ENV === 'prod' ? ENVMAP[countryHttpENV ? countryHttpENV : ENV] : ENVMAP[ENV]
    const httpUrl = 'https://pre-guang.starblink.co/graphql'
    const { wishlistIframeToken } = await chrome.storage.sync.get('wishlistIframeToken')
    const queryIndex = query.indexOf('query')
    let step = 6
    let queryBegin=queryIndex
    if(queryIndex===-1){
      queryBegin=query.indexOf('mutation')
      step = 9
    }
    const queryEnd=query.indexOf('{')
    const fetchName = query.substring(queryBegin+step,queryEnd-1)
    const { visitorId } = await chrome.storage.sync.get('visitorId')
    try {
      let response = await fetch(`${httpUrl}/${fetchName}`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          token: wishlistIframeToken || '',
          deviceId: `GooglePlugIn-${visitorId}`,
        },
        body: JSON.stringify({
          query: query,
        }),
      })
      let result = await response.json()
      const vpnError = result.errors ? result.errors[0]?.extensions?.code : ''
  
  
      if(vpnError === '201012001'){
        // return await getCountryHttpENV(query, comp)
      }else{
        return {
          status: response.status,
          data: result.data,
          errors: result.errors,
        }
      }
    } catch (e) {
      comp({ message: e.message })
      console.error(e.message)
    }
  }
  
const chrome = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')
const getData = async () => {
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  })
  const page = await browser.newPage()
  await page.goto('https://ncov.dxy.cn/ncovh5/view/pneumonia')
  const data = await page.evaluate(body => {
    const extractData = (row) => {
        const [area, , confirmed, dead, cured] = [...row.querySelectorAll('p')]
      if (area) {
          return {
            area: area.innerText,
          confirmed: +confirmed.innerText.replace(',', '') || 0,
          dead: +dead.innerText.replace(',', '') || 0,
          cured: +cured.innerText.replace(',', '') || 0
        }
      }
    }
    // Open tables, except already opened tables
    [...document.querySelectorAll(".areaBlock1___3qjL7")].forEach(e => {
        if (e.parentElement.childElementCount === 1) {
          e.click()
      }
    });
    // Expand all lists
    [...document.querySelectorAll('.expandRow___1Y0WD')].forEach(e => e.click())
    const tables = document.querySelectorAll('.areaBox___Sl7gp')
    // Extract values for china
    // const [diagnosed, suspected, critical, cDiagnosed, dead, cured] = [...document.querySelectorAll('.count___2lQ55 li')].map(block => block.querySelector('strong').innerText)
    // const china = {
      //   area: '中国',
    //   confirmed: +cDiagnosed.replace(',', ''),
    //   dead: +dead.replace(',', ''),
    //   cured: +cured.replace(',', '')
    // }
    return {
        data: [
          [...tables[0].querySelectorAll('.areaBlock1___3qjL7:not(.titleBlock___wqKiU)')].map(extractData),
        [...tables[1].querySelectorAll('.areaBlock2___2gER7:not(.titleBlock___wqKiU)')].map(extractData)
        // .concat(china)
      ],
      lastUpdated: /(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/.exec(document.querySelector('.title___gFzu3').innerText)[0]
    }
  })
  await browser.close()
  return data
}
module.exports = getData

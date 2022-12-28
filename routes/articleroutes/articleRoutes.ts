import puppeteer from "puppeteer-core";
import { Puppeteer , executablePath } from "puppeteer"
import cheerio from "cheerio"
import type { Browser } from "puppeteer-core"
import { Configuration, OpenAIApi } from "openai";
import ConfigInit from "../../setup/environmentSetup";
import express from "express"
import { handlerWrapper } from "../../error_handling/errorMiddlewear";
import { HTTPError, BaseError } from "../../error_handling/errors";



ConfigInit()

const config = new Configuration({apiKey: process.env.OPENAI_KEY})
const client = new OpenAIApi(config)
const router = express.Router()

type HTMLString = string
let browser: Browser

async function GetHTMLData(link: string): Promise<HTMLString> {
    let options = {
        headless: true,
        executablePath: executablePath()
    }
  
    if (!browser){
        browser = await puppeteer.launch(options)
    }

    const page = await browser.newPage()
    const response = await page.goto(link)
    await page.waitForNetworkIdle()


    if (page.url().toLowerCase().includes("signin")) {
        throw new Error("Article was private")
    }
    const html = await page.content()
    
    page.close()
    return html
}

export async function ScrapeMediumPage(MediumLink: string) {
    const html = await GetHTMLData(MediumLink)    
    const $ = cheerio.load(html)
    const article = $("article section div")
    const stringdata = article.html() as string
    let children = $(`article div div section div`)
    const n = children.length

    const headings = []
    const texts = []
    let textHTML  = $(`article div div section div:nth-child(1) div:nth-child(2)`).html()    
    for (let i = 1 ; i <= n ; i ++ ){
        let heading = $(`article div div section div:nth-child(1) div:nth-child(${i}) h1`).text()
        let parent = $(`article div div section div:nth-child(1) div:nth-child(${i})`)
        const k = parent.children().length
        for (let j = 1; j <= k; j ++ ) {
            let text = $(`article div div section div:nth-child(1) div:nth-child(${i}) p:nth-child(${j})`).text()
            text = text.replace(/\n/g, "")
            text = text.replace(/[\s]{2,}/g, " ")
            if (text !== "") texts.push(text)
        }
    
        let textHTML  = $(`article div div section div:nth-child(1) div:nth-child(1)`).html()    
        
        heading = heading.replace(/\n/g, "")
        heading = heading.replace(/[\s]{2,}/g, " ")
        if (heading !== "") headings.push(heading)

    }

    return texts.join("\n")
}



async function SummarizeText(text: string) {
    const N_OUT_TOKENS = 384
    const prompt = text + "\n" + `tl;dr in ${Math.floor(N_OUT_TOKENS / 2)} words`
    const completion = await client.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: N_OUT_TOKENS
    });
    
    return completion.data.choices[0].text
}



const articleSummaryHandler = async (req: express.Request,res: express.Response) => {
      const articleLink = req.body.articleLink;
      if (!articleLink) {
        throw new HTTPError("No article link provided", {
            HTTPErrorCode: 400,
            endUserMessage: "No article link provided",
            resource: articleSummaryHandler,
            routePath: "/api/articles"
        })

      }
      const articleText = await ScrapeMediumPage(articleLink)
      let summary = await SummarizeText(articleText)
      summary = summary?.trim()
      res.status(200).send({ summary })
  }

router.post("/", handlerWrapper(articleSummaryHandler))

export default router
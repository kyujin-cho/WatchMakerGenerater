import Koa from 'koa'
import Router from 'koa-router'
import Body from 'koa-body'
import Views from 'koa-views'
import Static from 'koa-static'
import Axios, { AxiosResponse } from 'axios'

const downloadURLfromRedirected = (url: string) => {
  const splitted = url.split('/')
  return `http://s3.amazonaws.com/watchfrenzy/watches/${
    splitted[splitted.length - 1]
  }.watch`
}

const PORT = process.env.PORT || 3000

const router = new Router()

router.get('/', async ctx => {
  await ctx.render('index.pug')
})

router.post('/', async ctx => {
  try {
    console.log(ctx.request.body)
    const response = await Axios.get(
      'https://facerepo.com/' + ctx.request.body.link,
      {
        maxRedirects: 0,
        validateStatus: status => status < 400,
      }
    )
    const redirectLocation = response.headers.location
    let downloadURL = ''
    console.log(redirectLocation)

    if (!redirectLocation) throw new Error('URL not valid!')
    if (redirectLocation.startsWith('http://www.getwatchmaker.com/watch')) {
      downloadURL = downloadURLfromRedirected(redirectLocation)
    } else if (
      redirectLocation.startsWith('https://facerepo.com/app/download/file')
    ) {
      downloadURL = redirectLocation
    } else {
      throw new Error('URL not valid!')
    }

    ctx.body = {
      success: true,
      downloadURL,
    }
  } catch (e) {
    ctx.body = {
      success: false,
      error: e.message || 'URL not valid!',
    }
  }
})

const app = new Koa()
app.use(Body())
app.use(Views(__dirname + '/views', { extension: 'pug' }))
app.use(Static(__dirname + '/static'))
app.use(router.routes())

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
